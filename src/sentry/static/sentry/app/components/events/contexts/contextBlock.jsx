import PropTypes from 'prop-types';
import React from 'react';
import {sortBy} from 'lodash';

import {defined} from '../../../utils';
import ErrorBoundary from '../../errorBoundary';
import KeyValueList from '../interfaces/keyValueList';

class ContextBlock extends React.Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    knownData: PropTypes.array,
  };

  render() {
    let data = [];
    let className = `context-block context-block-${this.props.data.type}`;

    (this.props.knownData || []).forEach(([key, value]) => {
      let allowSkip = false;
      if (key[0] === '?') {
        allowSkip = true;
        key = key.substr(1);
      }
      if (!defined(value)) {
        if (allowSkip) {
          return;
        }
        value = 'n/a';
      }
      data.push([key, value]);
    });

    let extraData = [];
    for (let key in this.props.data) {
      if (key !== 'type' && key !== 'title') {
        extraData.push([key, this.props.data[key]]);
      }
    }

    if (extraData.length > 0) {
      data = data.concat(sortBy(extraData, (key, value) => key));
    }

    return (
      <div className={className}>
        <ErrorBoundary mini>
          <KeyValueList data={data} isSorted={false} />
        </ErrorBoundary>
      </div>
    );
  }
}

export default ContextBlock;
