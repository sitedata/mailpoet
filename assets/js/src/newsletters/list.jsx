import React from 'react'
import { Router, Route, IndexRoute, Link, useRouterHistory } from 'react-router'
import { createHashHistory } from 'history'

import ListingTabs from 'newsletters/listings/tabs.jsx'
import ListingStandard from 'newsletters/listings/standard.jsx'
import ListingWelcome from 'newsletters/listings/welcome.jsx'
import ListingNotification from 'newsletters/listings/notification.jsx'
import classNames from 'classnames'
import jQuery from 'jquery'
import MailPoet from 'mailpoet'

const NewsletterList = React.createClass({
  pauseSending(item) {
    MailPoet.Ajax.post({
      endpoint: 'sendingQueue',
      action: 'pause',
      data: item.id
    }).done(() => {
      jQuery('#resume_'+item.id).show();
      jQuery('#pause_'+item.id).hide();
    });
  },
  resumeSending(item) {
    MailPoet.Ajax.post({
      endpoint: 'sendingQueue',
      action: 'resume',
      data: item.id
    }).done(() => {
      jQuery('#pause_'+item.id).show();
      jQuery('#resume_'+item.id).hide();
    });
  },
  renderStatus(item) {
    if (!item.queue) {
      return (
        <span>{MailPoet.I18n.t('notSentYet')}</span>
      );
    } else {
      if (item.queue.status === 'scheduled') {
        return (
          <span>{MailPoet.I18n.t('scheduledFor')}  { MailPoet.Date.format(item.queue.scheduled_at) } </span>
        )
      }
      const progressClasses = classNames(
        'mailpoet_progress',
        { 'mailpoet_progress_complete': item.queue.status === 'completed'}
      );

      // calculate percentage done
      const percentage = Math.round(
        (item.queue.count_processed * 100) / (item.queue.count_total)
      );

      let label = false;

      if (item.queue.status === 'completed') {
        label = (
          <span>
            {
              MailPoet.I18n.t('newsletterQueueCompleted')
              .replace("%$1d", item.queue.count_processed - item.queue.count_failed)
              .replace("%$2d", item.queue.count_total)
            }
          </span>
        );
      } else {
        label = (
          <span>
            { item.queue.count_processed } / { item.queue.count_total }
            &nbsp;&nbsp;
            <a
              id={ 'resume_'+item.id }
              className="button"
              style={{ display: (item.queue.status === 'paused') ? 'inline-block': 'none' }}
              href="javascript:;"
              onClick={ this.resumeSending.bind(null, item) }
            >{MailPoet.I18n.t('resume')}</a>
            <a
              id={ 'pause_'+item.id }
              className="button mailpoet_pause"
              style={{ display: (item.queue.status === null) ? 'inline-block': 'none' }}
              href="javascript:;"
              onClick={ this.pauseSending.bind(null, item) }
            >{MailPoet.I18n.t('pause')}</a>
          </span>
        );
      }

      return (
        <div>
          <div className={ progressClasses }>
              <span
                className="mailpoet_progress_bar"
                style={ { width: percentage + "%"} }
              ></span>
              <span className="mailpoet_progress_label">
                { percentage + "%" }
              </span>
          </div>
          <p style={{ textAlign:'center' }}>
            { label }
          </p>
        </div>
      );
    }
  },
  renderStatistics(item) {
    if (
      !item.statistics
      || !item.queue
      || ~~(item.queue.count_processed) === 0
      || item.queue.status === 'scheduled'
    ) {
      return (
        <span>
          {MailPoet.I18n.t('notSentYet')}
        </span>
      );
    }

    const percentage_clicked = Math.round(
      (item.statistics.clicked * 100) / (item.queue.count_processed)
    );
    const percentage_opened = Math.round(
      (item.statistics.opened * 100) / (item.queue.count_processed)
    );
    const percentage_unsubscribed = Math.round(
      (item.statistics.unsubscribed * 100) / (item.queue.count_processed)
    );

    return (
      <span>
        { percentage_opened }%,
        { percentage_clicked }%,
        { percentage_unsubscribed }%
      </span>
    );
  },
  renderItem(newsletter, actions) {
    const rowClasses = classNames(
      'manage-column',
      'column-primary',
      'has-row-actions'
    );

    const segments = newsletter.segments.map(function(segment) {
      return segment.name
    }).join(', ');

    return (
      <div>
        <td className={ rowClasses }>
          <strong>
            <a>{ newsletter.subject }</a>
          </strong>
          { actions }
        </td>
        <td className="column" data-colname={ MailPoet.I18n.t('status') }>
          { this.renderStatus(newsletter) }
        </td>
        <td className="column" data-colname={ MailPoet.I18n.t('lists') }>
          { segments }
        </td>
        <td className="column" data-colname={ MailPoet.I18n.t('statistics') }>
          { this.renderStatistics(newsletter) }
        </td>
        <td className="column-date" data-colname={ MailPoet.I18n.t('createdOn') }>
          <abbr>{ MailPoet.Date.format(newsletter.created_at) }</abbr>
        </td>
        <td className="column-date" data-colname={ MailPoet.I18n.t('lastModifiedOn') }>
          <abbr>{ MailPoet.Date.format(newsletter.updated_at) }</abbr>
        </td>
      </div>
    );
  },
  render() {
    console.log(this.props.params);
    return (
      <div>
        <h1 className="title">
          {MailPoet.I18n.t('pageTitle')} <Link className="page-title-action" to="/new">{MailPoet.I18n.t('new')}</Link>
        </h1>

        <ListingTabs tab="standard" />

        <ListingStandard params={ this.props.params } />
      </div>
    );
  }
});

module.exports = NewsletterList;