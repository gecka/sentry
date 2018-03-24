import PropTypes from 'prop-types';
import React from 'react';
import {Link} from 'react-router';
import {isEmpty} from 'lodash';

import SentryTypes from '../../proptypes';

import EventDataSection from './eventDataSection';
import {isUrl, deviceNameMapper} from '../../utils';
import {t} from '../../locale';
import Pills from '../pills';
import Pill from '../pill';
import VersionHoverCard from '../versionHoverCard';
import InlineSvg from '../inlineSvg';

class EventTags extends React.Component {
  static propTypes = {
    group: SentryTypes.Group.isRequired,
    event: SentryTypes.Event.isRequired,
    orgId: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
  };

  render() {
    let tags = this.props.event.tags;
    if (isEmpty(tags)) return null;

    let {orgId, projectId} = this.props;
    return (
      <EventDataSection
        group={this.props.group}
        event={this.props.event}
        title={t('Tags')}
        type="tags"
        className="p-b-1"
      >
        <Pills className="no-margin">
          {tags.map(tag => {
            return (
              <Pill key={tag.key} name={tag.key}>
                <Link
                  to={{
                    pathname: `/${orgId}/${projectId}/`,
                    query: {query: `${tag.key}:"${tag.value}"`},
                  }}
                >
                  {deviceNameMapper(tag.value)}
                </Link>
                {isUrl(tag.value) && (
                  <a href={tag.value} className="external-icon">
                    <em className="icon-open" />
                  </a>
                )}
                {tag.key == 'release' && (
                  <VersionHoverCard
                    containerClassName="pill-icon"
                    version={tag.value}
                    orgId={orgId}
                    projectId={projectId}
                  >
                    <Link to={`/${orgId}/${projectId}/releases/${tag.value}/`}>
                      <InlineSvg src="icon-circle-info" size="14px" />
                    </Link>
                  </VersionHoverCard>
                )}
              </Pill>
            );
          })}
        </Pills>
      </EventDataSection>
    );
  }
}

export default EventTags;
