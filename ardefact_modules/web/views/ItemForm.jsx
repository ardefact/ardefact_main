import React from 'react';
import $ from 'jquery';
import _ from 'lodash';

export default class ItemForm extends React.Component {
  constructor() {
    super();

    this.state = {
      gettingDraft: true,
      location: '',
      name: '',
      cost: '',
      rarity: null,
      isCluster: null,
      pictures: []
    };

    this.getDraft = this.getDraft.bind(this);
    this.updateForm = _.debounce(this.updateForm.bind(this), 300);
    this.uploadImage = this.uploadImage.bind(this);
    this.handleRarityChange= this.handleRarityChange.bind(this);
  }

  componentDidMount() {
    this.getDraft();
  }

  uploadImage() {

    let formData = new FormData();
    formData.append('userImage', this.imageUpload.files[0]);

    $.ajax({
      url: '/api/item_form/image',
      type: 'POST',
      data: formData,
      // Tell jQuery not to process data or worry about content-type
      // You *must* include these options!
      cache: false,
      contentType: false,
      processData: false,
      // Custom XMLHttpRequest
      xhr: function() {
        var myXhr = $.ajaxSettings.xhr();
        if (myXhr.upload) {
          // For handling the progress of the upload
          myXhr.upload.addEventListener('progress', function(e) {
            if (e.lengthComputable) {
              $('progress').attr({
                value: e.loaded,
                max: e.total,
              });
            }
          } , false);
        }
        return myXhr;
      },
      success: (data, textStatus, response) => {
        console.log(response);
        const res = JSON.parse(response.responseText);
        this.setState({
          pictures: this.state.pictures.concat(res)
        });
      }
    });
  }

  handleImageUpload(e) {
    this.uploadImage();
  }

  getDraft() {
    $.ajax({
      url: '/api/item_form',
      success: (data, textStatus, response) => {
        const res = JSON.parse(response.responseText);
        if(res != null) {
          this.setState({
            location: res.location,
            cost: res.cost,
            name: res.name,
            rarity: res.rarity,
            isCluster: res.isCluster ? 1 : 0,
            gettingDraft: false,
            pictures: res.pictures
          });
        }
        else {
          this.setState({gettingDraft: false});
        }
      }
    });
  }

  updateForm() {

    let data = {
      name: this.state.name,
      location: this.state.location,
      cost: this.state.cost,
      rarity: this.state.rarity,
      isCluster: this.state.isCluster == 1 ? true : false
    };

    $.ajax({
      url: '/api/item_form',
      data: data,
      method: 'POST'
    });
  }

  isClusterChange(e) {
    this.setState({isCluster: e.target.value}, this.updateForm);
  }

  nameChange(e) {
    this.setState({name: e.target.value}, this.updateForm);
  }

  locationChange(e) {
    this.setState({location: e.target.value}, this.updateForm);
  }

  costChange(e) {
    this.setState({cost: e.target.value}, this.updateForm);
  }

  handleRarityChange(e) {
    this.setState({rarity: e.target.value}, this.updateForm);
  }

  removeImage(index) {
    $.ajax({
      url: '/api/item_form/image/' + index,
      method: 'DELETE',
      success: (data, textStatus, response) => {
        var newPictures = this.state.pictures.slice();
        newPictures.splice(index, 1);
        this.setState({pictures: newPictures});
      }
    });
  }

  clickFileInput(e) {
    e.preventDefault();

    $(this.imageUpload).click();
  }

  submitItemForm(e) {
    e.preventDefault();

    $.ajax({
      url: '/api/item',
      method: 'POST',
      data: {
        detailedInfo: this.state.name,
        headline: this.state.name,
        rarity: this.state.rarity,
        isCluster: this.state.isCluster == 1 ? true : false,
        price: this.state.price
      },
      success: (data, textStatus, response) => {
        this.props.history.push("/item_list");
      }
    });
  }

  render() {
    const images = this.state.pictures.map((item, index) => {
      return <ImageDisplay src={item.uris.full} key={index} removeImage={this.removeImage.bind(this, index)}/>;
    });

    return (
      <form onSubmit={this.submitForm} style={{visibility: this.state.gettingDraft ? 'hidden' : 'visible'}}>

       <div id="itemFormOuterArea" className="clearFix">

         <div id="itemFormInnerArea">

           <div id="itemFormTitle">
             I found something!
           </div>

           {/* Item or Cluster */}

           <div className="itemFormRow">
             There's
             <input id="searchFilterClusters" type="radio" name="singleOrMultiple" value={1} checked={this.state.isCluster == 1} className="hideInput" onChange={this.isClusterChange.bind(this)}/>
             <label htmlFor="searchFilterClusters" className="itemFormRadioButton">
               a bunch of stuff
             </label>
             <input id="searchFilterItems" type="radio" name="singleOrMultiple" value={0} checked={this.state.isCluster == 0} className="hideInput" onChange={this.isClusterChange.bind(this)}/>
             <label htmlFor="searchFilterItems" className="itemFormRadioButton">
               a thing
             </label>
           </div>

           {/* Name */}

           <div className="itemFormRow fillUpRowDiv">
             called
             <input id="itemFormInputName" name="name" className="universalTextFieldSettings fillUpRowInput" type="text"
                    placeholder="a name" value={this.state.name} onChange={this.nameChange.bind(this)}/>
           </div>

           {/* Location */}

           <div className="itemFormRow fillUpRowDiv">
             in
             <input id="itemFormInputLocation" name="location" className="universalTextFieldSettings fillUpRowInput" type="text"
                    placeholder="a place" value={this.state.location} onChange={this.locationChange.bind(this)}/>
           </div>

           {/* Cost */}

           <div className="itemFormRow fillUpRowDiv">
             and costs around
             <input id="itemFormInputCost" name="cost" className="universalTextFieldSettings fillUpRowInput" type="text"
                    placeholder="a price" value={this.state.cost} onChange={this.costChange.bind(this)}/>.
           </div>

           {/* Rarity */}

           <div id="itemFormRarityArea">

             <div id="itemFormRarityAreaTitle">
               In terms of its rarity, it seems to be
             </div>
             <div>
               <input id="itemFormInputRarityUnique" type="radio" name="itemRarity" value={0} checked={this.state.rarity == 0} onChange={this.handleRarityChange} className="hideInput"/>
               <label htmlFor="itemFormInputRarityUnique" className="itemFormCheckbox">Unique: remarkably different and
                 one of a kind</label>
             </div>
             <div>
               <input id="itemFormInputRarityRare" type="radio" name="itemRarity" value={1} checked={this.state.rarity == 1} onChange={this.handleRarityChange} className="hideInput"/>
               <label htmlFor="itemFormInputRarityRare" className="itemFormCheckbox">Rare: very limited in number or
                 exclusively made</label>
             </div>
             <div>
               <input id="itemFormInputRarityUncommon" type="radio" name="itemRarity" value={2} checked={this.state.rarity == 2} onChange={this.handleRarityChange} className="hideInput"/>
               <label htmlFor="itemFormInputRarityUncommon" className="itemFormCheckbox">Uncommon: plenty from a
                 certain merchant or area</label>
             </div>
             <div>
               <input id="itemFormInputRarityRegional" type="radio" name="itemRarity" value={3} checked={this.state.rarity == 3} onChange={this.handleRarityChange} className="hideInput"/>
               <label htmlFor="itemFormInputRarityRegional" className="itemFormCheckbox">Regional: plenty throughout
                 the entire region</label>
             </div>

           </div>

           <div className="buttonArea">
             <input style={{display: 'none'}} name="userImage" className="fillUpRowInput" type="file" ref={c=>this.imageUpload=c} onChange={this.handleImageUpload.bind(this)}/>
             <button className="moreButton" onClick={this.clickFileInput.bind(this)}>Add Some Pictures</button>
           </div>

           <div className="itemFormPictures">
             {images}
           </div>

           {/* Submit Button */}

           <div className="buttonArea">
             <button type="submit" className="moreButton" name="itemSubmitButton" onClick={this.submitItemForm.bind(this)}>
               Add It To The Catalog
             </button>
           </div>

         </div>

       </div>

      </form>
    )
  }
}

class ImageDisplay extends React.Component {
  constructor() {
    super();

    this.state = {
      hovered: false
    };
  }

  showHideOverlay(showHide) {
    this.setState({hovered: showHide});
  }

  render() {
    return (
      <div
        style={{position:"relative"}}
        onMouseEnter={this.showHideOverlay.bind(this, true)}
        onMouseLeave={this.showHideOverlay.bind(this, false)}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            left: 0,
            bottom: 0,
            backgroundColor: 'rgba(52, 52, 52, 0.8)',
            display: this.state.hovered ? 'block' : 'none',
            fontSize: "30px",
            padding: "10px"
          }}
        >
          <a href="javascript:void(0);" style={{float: "right"}} onClick={this.props.removeImage}>&#x274c;</a>
        </div>
        <img src={'uploads/' + this.props.src} alt="z"/>
      </div>
    )
  }
}
