import React, { Component } from 'react';
import { toast } from 'react-toastify';
import { css } from '@emotion/core';
import PulseLoader from 'react-spinners/PulseLoader';
import ProgressiveImage from 'react-progressive-image';
import PropTypes from 'prop-types';
import s from './ImageGalleryView.module.css';
import imageAPI from '../../services/pixabay-api';
import initialScreenPlaceholder from '../../images/initialScreenPlaceholder.jpg';
import errorPlaceholder from '../../images/errorPlaceholder.jpg';
import Modal from '../Modal';
import ImageGallery from '../ImageGallery';

const Status = {
  IDLE: 'idle',
  PENDING: 'pending',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
};

class ImageGalleryView extends Component {
  state = {
    images: null,
    totalSearchResults: null,
    error: null,
    status: Status.IDLE,
    modalIsOpen: false,
    imageInModal: '',
    activeImage: '',
  };

  componentDidUpdate(prevProps) {
    const prevQuery = prevProps.searchQuery;
    const nextQuery = this.props.searchQuery;
    const prevPage = prevProps.page;
    const nextPage = this.props.page;

    if (prevQuery !== nextQuery) {
      this.renderNewSearchQuery(nextQuery, nextPage);
    }

    if (prevPage !== nextPage && prevPage < nextPage) {
      this.renderMorePages(nextQuery, nextPage);
    }
  }

  updateImageAvialability = () => {
    if (this.state.images) {
      const result =
        this.state.totalSearchResults > this.state.images.length ? true : false;
      this.props.updateImageAvialability(result);
    } else {
      this.props.updateImageAvialability(false);
    }
  };

  renderNewSearchQuery = (nextQuery, nextPage) => {
    this.props.resetSearchPage();
    this.setState({ images: null, status: Status.PENDING });
    this.props.updateImageAvialability(false);

    imageAPI
      .fetchImages(nextQuery, nextPage)
      .then(images => {
        console.log(images);
        if (images.totalHits === 0) {
          toast.error(`No images for ${nextQuery}. Please try another query.`);
          this.setState({
            status: Status.REJECTED,
          });

          return;
        }
        if (images.hits.length === 0) {
          toast.error(
            `Oops! Pixabay failed us and forgot to send images. Please refresh page & try again.`,
          );
          this.setState({
            status: Status.REJECTED,
          });

          return;
        }
        this.setState({
          images: images.hits,
          totalSearchResults: images.totalHits,
          status: Status.RESOLVED,
        });
      })
      .catch(error => this.setState({ error, status: Status.REJECTED }))
      .finally(data => {
        this.updateImageAvialability();
      });
  };

  renderMorePages = (nextQuery, nextPage) => {
    this.props.updateImageAvialability(false);

    imageAPI
      .fetchImages(nextQuery, nextPage)
      .then(images => {
        this.setState(prevState => ({
          images: [...prevState.images, ...images.hits],
        }));
      })
      .catch(error => this.setState({ error, status: Status.REJECTED }))
      .finally(data => {
        window.scrollTo({
          top: document.documentElement.scrollHeight - 1300,
          behavior: 'smooth',
        });
        this.updateImageAvialability();
      });
  };

  toggleModal = () => {
    this.setState(prevState => ({
      modalIsOpen: !prevState.modalIsOpen,
      imageInModal: '',
      activeImage: '',
    }));
  };

  showBigImageInModal = e => {
    this.toggleModal();
    this.setState(prevState => ({
      imageInModal: prevState.imageInModal ? '' : e.target.dataset.image,
      activeImage: prevState.activeImage ? '' : e.target.src,
    }));
  };

  render() {
    const {
      status,
      modalIsOpen,
      imageInModal,
      activeImage,
      images,
    } = this.state;

    if (status === Status.IDLE) {
      return (
        <div>
          <img src={initialScreenPlaceholder} alt="please enter a query" />
        </div>
      );
    }

    if (status === Status.PENDING) {
      return (
        <PulseLoader
          css={css`
            margin: 4px;
          `}
          size={25}
          color={'blue'}
          loading={true}
        />
      );
    }

    if (status === Status.REJECTED) {
      return (
        <div>
          <img src={errorPlaceholder} alt="error" />
        </div>
      );
    }

    if (status === Status.RESOLVED) {
      return (
        <>
          <ImageGallery
            images={images}
            showBigImageInModal={this.showBigImageInModal}
          />
          {modalIsOpen && (
            <Modal toggleModal={this.toggleModal}>
              <ProgressiveImage src={imageInModal} placeholder={activeImage}>
                {(src, loading) => (
                  <img
                    style={{ opacity: loading ? 0.5 : 1 }}
                    src={src}
                    alt=""
                    className={s.image}
                  />
                )}
              </ProgressiveImage>
            </Modal>
          )}
        </>
      );
    }
  }
}

export default ImageGalleryView;

ImageGalleryView.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  page: PropTypes.number.isRequired,
  resetSearchPage: PropTypes.func.isRequired,
  updateImageAvialability: PropTypes.func.isRequired,
};
