from bidict import bidict
import json
import logging

from airtable import Airtable
from slack.web.client import WebClient

#
# This script will read from the CHMA volunteer airtable and use responses to the "ways to help" column to
# add corresponding the volunteer's corresponding slack user to channels and usergroups. At the moment, it matches up
# up volunteers to users by using email addresses as the key. See main() for where to comment/uncomment
#

# modify these maps for testing

AIRTABLE_HELP_TO_SLACK_CHANNELS_MAP = {
    'Bike delivery': [],
    'Car delivery': [],
    'On foot delivery': [],
    'Financial support': [],
    'Child care': [],
    'Phoning Neighbors in need': [],
    'Tech/admin support': [],
    'Automation': [],
}
ALL_CHANNELS = ['cars_and_bikes']

AIRTABLE_HELP_TO_SLACK_USERGROUP_MAP = {
    'Bike delivery': [],
    'Car delivery': ['cars'],
    'On foot delivery': [],
    'Financial support': [],
    'Child care': [],
    'Phoning Neighbors in need': [],
    'Tech/admin support': [],
    'Automation': [],
}
ALL_GROUPS = ['cars']

logging.basicConfig(level=logging.INFO, format='%(asctime)s : %(levelname)s : %(message)s')


def build_transfer_map(airtable_volunteers, email2slackid, help_map, transfer_map):
    for volunteer in airtable_volunteers:
        airtable_email = volunteer['fields'].get('volunteer_email')
        if airtable_email is not None:
            airtable_email = airtable_email.lower()
        ways_to_help = volunteer['fields'].get('volunteer_ways_to_help')
        if airtable_email in email2slackid and ways_to_help is not None:
            for help_way in ways_to_help:
                channels = help_map.get(help_way, [])
                for channel in channels:
                    if channel in transfer_map:
                        if email2slackid[airtable_email] not in transfer_map[channel]['current_member_ids']:
                            addition_list = transfer_map[channel]['new_member_ids']
                            addition_list.append(email2slackid[airtable_email])
                            transfer_map[channel]['new_member_ids'] = addition_list
                    else:
                        logging.error(' {0} : no slack channel/group by this name'.format(channel))
        elif airtable_email not in email2slackid:
            logging.warning(' {0} : no slack user found for this email address'.format(airtable_email))
        elif ways_to_help is None:
            logging.info(' {0} : volunteer has no ways to help selected'.format(airtable_email))
    return transfer_map


def get_config_from_file(path='config.json'):
    with open(path, 'r') as f:
        config = json.load(f)
    return config


def get_slack_email2id_dict(slack_client):
    email2slackid = bidict()
    slack_users_list = slack_client.users_list().data['members']
    for user in slack_users_list:
        user_email = user['profile'].get('email', None)
        if user_email is not None:
            email2slackid[user_email] = user['id']
    return email2slackid


def get_volunteers_from_airtable(airtable_base, airtable_key):
    # connect to airtable and get volunteer records from airtable api
    airtable = Airtable(airtable_base, 'Volunteers', api_key=airtable_key)
    airtable_volunteers = airtable.get_all()
    if len(airtable_volunteers) == 0:
        logging.warning('no records in table')

    return airtable_volunteers


def initialize_channels_transfer_map(slack_client):
    conversations_list = slack_client.conversations_list().data
    slack_channels = conversations_list['channels']
    transfer_map = {}
    for channel in slack_channels:
        if channel['name'] not in ALL_CHANNELS:
            continue
        transfer_map[channel['name']] = {
            'id': channel['id'],
            'current_member_ids': slack_client.conversations_members(channel=channel['id']).data['members'],
            'new_member_ids': []
        }

    return transfer_map


def initialize_usergroups_transfer_map(slack_client):
    usergroup_list = slack_client.usergroups_list()['usergroups']
    transfer_map = {}
    for usergroup in usergroup_list:
        if usergroup['handle'] not in ALL_GROUPS:
            continue
        transfer_map[usergroup['handle']] = {
            'id': usergroup['id'],
            'current_member_ids': slack_client.usergroups_users_list(usergroup=usergroup['id'])['users'],
            'new_member_ids': []
        }

    return transfer_map


def create_missing_usergroups(slack_client):
    resp = slack_client.usergroups_list()
    existing_usergroup_names = [group['name'] for group in resp['usergroups']]
    target_groups = set([group for grouplist in AIRTABLE_HELP_TO_SLACK_USERGROUP_MAP.values() for group in grouplist])
    for group in target_groups:
        if group not in existing_usergroup_names:
            slack_client.usergroups_create(name=group)


def do_channels(slack_client, airtable_volunteers, email2slackid):
    channels_transfer_map = initialize_channels_transfer_map(slack_client)
    channels_transfer_map = build_transfer_map(airtable_volunteers, email2slackid, AIRTABLE_HELP_TO_SLACK_CHANNELS_MAP,
                                               channels_transfer_map)

    for channel_name, channel_info in channels_transfer_map.items():
        if len(channel_info['new_member_ids']) > 0:
            new_user_emails = [email2slackid.inverse[slack_id] for slack_id in channel_info['new_member_ids']]
            logging.info('Slack Channel {0}: adding users {1}'.format(channel_name, ', '.join(new_user_emails)))
            slack_client.conversations_invite(channel=channel_info['id'], users=channel_info['new_member_ids'])


def do_usergroups(slack_client, airtable_volunteers, email2slackid):
    usergroups_transfer_map = initialize_usergroups_transfer_map(slack_client)
    usergroups_transfer_map = build_transfer_map(airtable_volunteers, email2slackid,
                                                 AIRTABLE_HELP_TO_SLACK_USERGROUP_MAP,
                                                 usergroups_transfer_map)

    for group_name, group_info in usergroups_transfer_map.items():
        logging.info('Group name {0}'.format(group_name))
        if len(group_info['new_member_ids']) > 0:
            new_user_emails = [email2slackid.inverse[slack_id] for slack_id in group_info['new_member_ids']]
            logging.info('Slack Group {0}: adding users {1}'.format(group_name, ', '.join(new_user_emails)))

            # we combine these lists because the update function overwrites the group membership. we need to include current
            # members or they will get erased
            new_user_list = group_info['new_member_ids'] + group_info['current_member_ids']
            slack_client.usergroups_users_update(usergroup=group_info['id'], users=new_user_list)


def main():
    CONFIG = get_config_from_file()

    airtable_volunteers = get_volunteers_from_airtable(CONFIG['AIRTABLE_BASE'], CONFIG['AIRTABLE_KEY'])

    slack_client = WebClient(token=CONFIG['SLACK_BOT_TOKEN'])

    email2slackid = get_slack_email2id_dict(slack_client)



    # do_channels(slack_client, airtable_volunteers, email2slackid)
    do_usergroups(slack_client, airtable_volunteers, email2slackid)


if __name__ == '__main__':
    main()
