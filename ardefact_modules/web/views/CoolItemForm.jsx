import React from 'react';
import $ from 'jquery';

export default class CoolItemForm extends React.Component {
  constructor() {
    super();

    this.state = {
        location: '',
        name: '',
        cost: '',
        rarity: null,
        isCluster: null
    };

    this.getDraft = this.getDraft.bind(this);
    this.submitForm = this.submitForm.bind(this);
    this.handleRarityChange= this.handleRarityChange.bind(this);
  }

  componentDidMount() {

    this.getDraft();
      /*
      $(':button').on('click', function() {
          $.ajax({
              // Your server script to process the upload
              url: '/item_form',
              type: 'POST',

              // Form data
              data: new FormData($('form')[0]),

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
          });
      });
      */

  }

  getDraft() {
    $.ajax({
      url: '/a/item_form',
      success: (data, textStatus, response) => {
        const res = JSON.parse(response.responseText);
        if(res != null) {
          this.setState({location: res.location, cost: res.cost, name: res.name, rarity: res.rarity, isCluster: res.isCluster ? 1 : 0, });
        }
      }
    });
  }

  submitForm(e) {
    e.preventDefault();

    let data = {
      name: this.state.name,
      location: this.state.location,
      cost: this.state.cost,
      rarity: this.state.rarity,
      isCluster: this.state.isCluster == 1 ? true : false
    };

    $.ajax({
      url: '/a/item_form',
      data: data,
      method: 'POST'
    });
  }

  isClusterChange(e) {
    this.setState({isCluster: e.target.value});
  }

  nameChange(e) {
    this.setState({name: e.target.value});
  }

  locationChange(e) {
    this.setState({location: e.target.value});
  }

  costChange(e) {
    this.setState({cost: e.target.value});
  }

  handleRarityChange(e) {
    this.setState({rarity: e.target.value});
  }

  render() {
   return (
     <form onSubmit={this.submitForm}>

       <div id="itemFormOuterArea" className="clearFix">

         <div id="itemFormInnerArea">

           <div id="itemFormTitle">
               I found something!
           </div>

           {/* Item or Cluster */}

           <div className="itemFormRow">
             There's
             <input id="searchFilterClusters" type="radio" name="singleOrMultiple" value={0} checked={this.state.isCluster == 0} className="hideInput" onChange={this.isClusterChange.bind(this)}/>
             <label htmlFor="searchFilterClusters" className="itemFormRadioButton">
                 a bunch of stuff
             </label>
             <input id="searchFilterItems" type="radio" name="singleOrMultiple" value={1} checked={this.state.isCluster == 1} className="hideInput" onChange={this.isClusterChange.bind(this)}/>
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

           {/* Submit Button */}

           <div id="foundButtonArea">
               <button type="submit" id="moreButton" name="itemSubmitButton">
                   Add It To The Catalog
               </button>
           </div>

         </div>

       </div>

     </form>
   )
  }
}