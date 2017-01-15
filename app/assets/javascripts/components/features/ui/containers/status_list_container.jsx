import { connect } from 'react-redux';
import StatusList from '../../../components/status_list';
import { expandTimeline, scrollTopTimeline } from '../../../actions/timelines';
import Immutable from 'immutable';
import { createSelector } from 'reselect';

const getStatusIds = createSelector([
  (state, { type }) => state.getIn(['settings', type], Immutable.Map()),
  (state, { type }) => state.getIn(['timelines', type, 'items'], Immutable.List()),
  (state)           => state.get('statuses')
], (columnSettings, statusIds, statuses) => statusIds.filter(id => {
  const statusForId = statuses.get(id);
  let showStatus    = true;

  if (columnSettings.getIn(['shows', 'reblog']) === false) {
    showStatus = showStatus && statusForId.get('reblog') === null;
  }

  if (columnSettings.getIn(['shows', 'reply']) === false) {
    showStatus = showStatus && statusForId.get('in_reply_to_id') === null;
  }

  if (columnSettings.getIn(['regex', 'body'], '').trim().length > 0) {
    try {
      const regex = new RegExp(columnSettings.getIn(['regex', 'body']).trim(), 'i');
      showStatus = showStatus && !regex.test(statusForId.get('reblog') ? statuses.getIn([statusForId.get('reblog'), 'content']) : statusForId.get('content'));
    } catch(e) {
      // Bad regex, don't affect filters
    }
  }

  return showStatus;
}));

const mapStateToProps = (state, props) => ({
  statusIds: getStatusIds(state, props)
});

const mapDispatchToProps = (dispatch, { type, id }) => ({

  onScrollToBottom () {
    dispatch(scrollTopTimeline(type, false));
    dispatch(expandTimeline(type, id));
  },

  onScrollToTop () {
    dispatch(scrollTopTimeline(type, true));
  },

  onScroll () {
    dispatch(scrollTopTimeline(type, false));
  }

});

export default connect(mapStateToProps, mapDispatchToProps)(StatusList);
