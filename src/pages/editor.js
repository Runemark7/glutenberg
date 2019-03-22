import React from 'react';
import { data, editPost, domReady, blocks } from '@frontkom/gutenberg-js';
import { types } from '../globals/fake-data';
import { getPage } from '../globals/api-fetch';
import '../Blocks/test';
// DETTA ÄR BYTAT
//import domReady from '@wordpress/dom-ready';



// Gutenberg JS Style
import '@frontkom/gutenberg-js/build/css/block-library/style.css';
import '@frontkom/gutenberg-js/build/css/style.css';
import './editor.css';
import axios from 'axios';

class Editor extends React.Component {
  constructor (props) {
    super(props);

    let type = window.location.pathname.replace(/\//g, '');
    type = type.slice(0, -1);

    this.state = {
      postType: type || 'page',
    };
  }

  componentDidMount () {
    const { postType } = this.state;

    const settings = {
      alignWide: true,
      availableTemplates: [],
      allowedBlockTypes: true,
      disableCustomColors: false,
      disablePostFormats: false,
      titlePlaceholder: 'Add title',
      bodyPlaceholder: 'Insert your custom block',
      isRTL: false,
      autosaveInterval: 0,
      postLock: {
        isLocked: false,
      },
      canPublish: false,
      canSave: true,
      canAutosave: true,
      mediaLibrary: true,
    };

    // Disable tips
    data.dispatch('core/nux').disableTips();

    // Initialize the editor
    window._wpLoadGutenbergEditor = new Promise(function (resolve) {
      domReady(function () {
        resolve(editPost.initializeEditor('editor', postType, 1, settings, {}));
      });
    }).then(function(){
        
        blocks.unregisterBlockType('core/paragraph');
        blocks.unregisterBlockType('core/image');

      });
  }

  resetLocalStorage = ev => {
    ev.preventDefault();

    localStorage.removeItem('g-editor-page');
    window.location.reload();
  };

  changePostType = (ev, type) => {
    ev.preventDefault();
    const slug = type.slice(0, -1);
    // update postType in localStorage before reload the editor
    const item = {
      ...getPage(slug),
      type: slug,
    };

    localStorage.setItem('g-editor-page', JSON.stringify(item));

    window.location.replace(type);
  };

  render () {
    const { postType } = this.state;

    return (
      <React.Fragment>
        <div className="editor-nav">
          {
            Object.keys(types).map(type => {
              return (
                <button
                  key={ type }
                  className={ `components-button ${type === postType ? 'is-primary' : ''}` }
                  onClick={ ev => this.changePostType(ev, types[type].rest_base) }
                >{ types[type].name }</button>
              );
            })
          }

          <button type="button" className="components-button is-tertiary"
            onClick={ this.resetLocalStorage }>Clear localStorage</button>
            <button type="button" className="components-button is-tertiary"
            onClick={ () => getDataFromDb() }>Hämta data från Agera</button>
            <button type="button" className="components-button is-tertiary"
            onClick={ () => sendDataToDb() }>Spara till molnet</button>
        </div>
        <div id="editor" className="gutenberg__editor"></div>
      </React.Fragment>
    );
    async function getDataFromDb(){
      console.log();
      const data = await axios.get('http://localhost:5000/api/products');
      const last = data.data.pop();

      localStorage.setItem('g-editor-page', JSON.stringify(last.content));
      window.location.reload();
      console.log('datan är hämtad och satt till aktuell version');
        
    }
    async function sendDataToDb(){
      const localSave = JSON.parse(localStorage.getItem('g-editor-page'));
      console.log(localSave);

      axios.post('http://localhost:5000/api/products', localSave);
      console.log("Sparat!");
    }
  }

}


export default Editor;
