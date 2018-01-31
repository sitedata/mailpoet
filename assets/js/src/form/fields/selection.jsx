define([
  'react',
  'react-dom',
  'jquery',
  'select2',
],
(
  React,
  ReactDOM,
  jQuery
) => {
  const Selection = React.createClass({
    getInitialState: function () {
      return {
        select2: false,
      };
    },
    allowMultipleValues: function () {
      return (this.props.field.multiple === true);
    },
    isSelect2Initialized: function () {
      return (this.state.select2 === true);
    },
    componentDidMount: function () {
      if (this.allowMultipleValues() || this.props.field.forceSelect2) {
        this.setupSelect2();
      }
    },
    componentDidUpdate: function (prevProps) {
      if (
        (this.props.item !== undefined && prevProps.item !== undefined)
        && (this.props.item.id !== prevProps.item.id)
      ) {
        jQuery(`#${this.refs.select.id}`)
          .val(this.getSelectedValues())
          .trigger('change');
      }
    },
    componentWillUnmount: function () {
      if (this.allowMultipleValues() || this.props.field.forceSelect2) {
        this.destroySelect2();
      }
    },
    destroySelect2: function () {
      if (this.isSelect2Initialized()) {
        jQuery(`#${this.refs.select.id}`).select2('destroy');
        this.state.select2 = false;
      }
    },
    setupSelect2: function () {
      if (this.isSelect2Initialized()) {
        return;
      }

      let select2Options = {
        width: (this.props.width || ''),
        templateResult: function (item) {
          if (item.element && item.element.selected) {
            return null;
          } else if (item.title) {
            return item.title;
          }
          return item.text;
        },
      };

      const remoteQuery = this.props.field.remoteQuery || null;
      if (remoteQuery) {
        select2Options = Object.assign(select2Options, {
          ajax: {
            url: window.ajaxurl,
            type: 'POST',
            dataType: 'json',
            data: function (params) {
              return {
                action: 'mailpoet',
                api_version: window.mailpoet_api_version,
                token: window.mailpoet_token,
                endpoint: remoteQuery.endpoint,
                method: remoteQuery.method,
                data: Object.assign(
                  remoteQuery.data,
                  { query: params.term }
                ),
              };
            },
            processResults: function (response) {
              return {
                results: response.data.map(item => (
                  { id: item.id || item.value, text: item.name || item.text }
                )),
              };
            },
          },
          minimumInputLength: remoteQuery.minimumInputLength || 2,
        });
      }

      const select2 = jQuery(`#${this.refs.select.id}`).select2(select2Options);

      let hasRemoved = false;
      select2.on('select2:unselecting', () => {
        hasRemoved = true;
      });
      select2.on('select2:opening', (e) => {
        if (hasRemoved === true) {
          hasRemoved = false;
          e.preventDefault();
        }
      });

      select2.on('change', this.handleChange);

      this.state.select2 = true;
    },
    getSelectedValues: function () {
      if (this.props.field.selected !== undefined) {
        return this.props.field.selected(this.props.item);
      } else if (this.props.item !== undefined && this.props.field.name !== undefined) {
        if (this.allowMultipleValues()) {
          if (Array.isArray(this.props.item[this.props.field.name])) {
            return this.props.item[this.props.field.name].map(item => item.id);
          }
        } else {
          return this.props.item[this.props.field.name];
        }
      }
      return null;
    },
    loadItems: function () {
      let items;
      if (typeof (window[`mailpoet_${this.props.field.endpoint}`]) !== 'undefined') {
        items = window[`mailpoet_${this.props.field.endpoint}`];
      } else if (this.props.field.values !== undefined) {
        items = this.props.field.values;
      }

      if (Array.isArray(items)) {
        if (this.props.field.filter !== undefined) {
          items = items.filter(this.props.field.filter);
        }
      }

      return items;
    },
    handleChange: function (e) {
      let value;
      if (this.props.onValueChange !== undefined) {
        if (this.props.field.multiple) {
          value = jQuery(`#${this.refs.select.id}`).val();
        } else {
          value = e.target.value;
        }
        const transformedValue = this.transformChangedValue(value);
        this.props.onValueChange({
          target: {
            value: transformedValue,
            name: this.props.field.name,
          },
        });
      }
    },
    getLabel: function (item) {
      if (this.props.field.getLabel !== undefined) {
        return this.props.field.getLabel(item, this.props.item);
      }
      return item.name;
    },
    getSearchLabel: function (item) {
      if (this.props.field.getSearchLabel !== undefined) {
        return this.props.field.getSearchLabel(item, this.props.item);
      }
      return null;
    },
    getValue: function (item) {
      if (this.props.field.getValue !== undefined) {
        return this.props.field.getValue(item, this.props.item);
      }
      return item.id;
    },
    // When it's impossible to represent the desired value in DOM,
    // this function may be used to transform the placeholder value into
    // desired value.
    transformChangedValue: function (value) {
      if (typeof this.props.field.transformChangedValue === 'function') {
        return this.props.field.transformChangedValue.call(this, value);
      }
      return value;
    },
    insertEmptyOption: function () {
      // https://select2.org/placeholders
      // For single selects only, in order for the placeholder value to appear,
      // we must have a blank <option> as the first option in the <select> control.
      if (this.allowMultipleValues()) return undefined;
      if (this.props.field.placeholder) return (<option />);
      return undefined;
    },
    render: function () {
      const items = this.loadItems(this.props.field);
      const options = items.map((item, index) => {
        const label = this.getLabel(item);
        const searchLabel = this.getSearchLabel(item);
        const value = this.getValue(item);

        return (
          <option
            key={`option-${index}`}
            value={value}
            title={searchLabel}
          >
            { label }
          </option>
        );
      });

      return (
        <select
          id={this.props.field.id || this.props.field.name}
          ref="select"
          disabled={this.props.field.disabled}
          data-placeholder={this.props.field.placeholder}
          multiple={this.props.field.multiple}
          defaultValue={this.getSelectedValues()}
          {...this.props.field.validation}
        >
          { this.insertEmptyOption() }
          { options }
        </select>
      );
    },
  });

  return Selection;
});
