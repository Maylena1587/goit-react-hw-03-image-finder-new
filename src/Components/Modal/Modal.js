import React, { Component } from 'react';
import { createPortal } from 'react-dom';
import { FaWindowClose } from 'react-icons/fa';
import { IconContext } from 'react-icons';
import PropTypes from 'prop-types';
import s from './Modal.module.css';

const modalRoot = document.querySelector('#modal-root');

class Modal extends Component {
  componentDidMount() {
    window.addEventListener('keydown', this.handleModalClosureOnEsc);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleModalClosureOnEsc);
  }

  handleModalClosureOnEsc = e => {
    if (e.code === 'Escape') {
      this.props.toggleModal();
    }
  };

  handleBackdropClick = e => {
    if (e.target === e.currentTarget) {
      this.props.toggleModal();
    }
  };

  handleBtnClick = () => {
    this.props.toggleModal();
  };

  render() {
    return createPortal(
      <div className={s.backdrop} onClick={this.handleBackdropClick}>
        <div className={s.content}>
          <button className={s.closeIcon} onClick={this.handleBtnClick}>
            <IconContext.Provider value={{ size: '36px' }}>
              <FaWindowClose />
            </IconContext.Provider>
          </button>
          {this.props.children}
        </div>
      </div>,
      modalRoot,
    );
  }
}

export default Modal;

Modal.propTypes = {
  toggleModal: PropTypes.func.isRequired,
};
