import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import MailPoet from 'mailpoet';

const Notice = ({
  onClose,
  onDisplay,
  renderInPlace,
  timeout,
  scroll,
  children,
  closable,
  type,
}) => {
  const [hidden, setHidden] = React.useState(false);
  const elementRef = React.useRef(null);
  const timeoutRef = React.useRef(null);

  const close = React.useCallback(() => {
    if (onClose) onClose();
    setHidden(true);
  }, [onClose]);

  React.useEffect(() => {
    if (timeout) {
      timeoutRef.current = setTimeout(close, timeout);
    }
    return () => (timeoutRef.current ? clearTimeout(timeoutRef.current) : null);
  }, [close, timeout]);

  React.useLayoutEffect(() => {
    if (scroll && elementRef.current) {
      elementRef.current.scrollIntoView(false);
    }
  }, [scroll]);

  React.useLayoutEffect(() => {
    if (onDisplay) onDisplay();
  }, [onDisplay]);

  if (hidden) return null;

  const content = (
    <div ref={elementRef} className={`mailpoet_base_notice mailpoet_${type}_notice`}>
      {children}
      {closable && (
        <button type="button" className="notice-dismiss" onClick={close}>
          <span className="screen-reader-text">{MailPoet.I18n.t('dismissNotice')}</span>
        </button>
      )}
    </div>
  );

  if (renderInPlace) {
    return content;
  }

  return ReactDOM.createPortal(
    content,
    document.getElementById('mailpoet_notices')
  );
};
Notice.propTypes = {
  type: PropTypes.oneOf(['success', 'info', 'warning', 'error']).isRequired,
  scroll: PropTypes.bool,
  closable: PropTypes.bool,
  renderInPlace: PropTypes.bool,
  onDisplay: PropTypes.func,
  onClose: PropTypes.func,
  timeout: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf([false])]),
  children: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]).isRequired,
};
Notice.defaultProps = {
  timeout: 10000,
  scroll: false,
  closable: true,
  renderInPlace: false,
  onDisplay: undefined,
  onClose: undefined,
};

export default Notice;
