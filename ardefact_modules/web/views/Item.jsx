import React from 'react';
import $ from 'jquery';

export default class ItemWrapper extends React.Component {
  constructor() {
    super();

    this.state = {
      pictureUris: [],
      mainPictureUri: '',
      headline: '',
      rarity: null,
      firstName: '',
      lastName: '',
      bio: '',
      userMainPictureUri: '',
      isSubmitter: false
    }
  }

  componentDidMount() {
    $.get(
      {
        url: '/api/item/' + this.props.match.params.id,
        success: (data, textStatus, response) => {
          var pictures = [];
          for(var i=0; i<data.pictures.length; i++) {
            pictures.push(data.pictures[i].uris.full)
          }

          var mainPictureUri = data.main_picture.uris.full;

          this.setState(
            {
              pictureUris: pictures,
              mainPictureUri: mainPictureUri,
              headline: data.headline,
              rarity: data.rarity,
              firstName: data.user.first_name,
              lastName: data.user.last_name,
              bio: data.user.bio,
              userMainPictureUri: data.user.main_picture.uris.full,
              isSubmitter: data.is_submitter,
              error: ""
            }
          )
        },
        error: function (error) {
          this.setState(
            {
              item: null,
              error: error,
            });
        }
      }
    );
  }

  removeItem() {
    $.ajax(
      {
        method: 'DELETE',
        url: '/api/item/' + this.props.match.params.id,
        success: (data, textStatus, response) => {
            this.props.history.push("/item_list");
        },
        error: function (error) {
        }
      }
    );
  }

  requestItem() {

    var data = {
      itemId: this.props.match.params.id
    };

    $.ajax(
      {
        method: 'POST',
        url: '/api/request',
        data: data,
        success: (data, textStatus, response) => {
          this.props.history.push("/item_list");
        },
        error: function (error) {
        }
      }
    );
  }

  render() {
    return (
      <Item
        pictureUris={this.state.pictureUris}
        mainPictureUri={this.state.mainPictureUri}
        bio={this.state.bio}
        headline={this.state.headline}
        rarity={this.state.rarity}
        userName={this.state.firstName + ' ' + this.state.lastName}
        userMainPictureUri={this.state.userMainPictureUri}
        isSubmitter={this.state.isSubmitter}
        removeItem={this.removeItem.bind(this)}
        requestItem={this.requestItem.bind(this)}
      />
    )
  }
}

class Item extends React.Component {
  render() {

    var rareTextClass = 'regionalTextColor';
    var rareText = 'regional';
    var rareExplain = 'plenty throughout the entire region';
    if(this.props.rarity == 1) {
      rareTextClass = 'uncommonTextColor';
      rareText = 'uncommon';
      rareExplain = 'plenty from a certain merchant or area';
    }
    else if(this.props.rarity == 2) {
      rareTextClass = 'rareTextColor';
      rareText = 'rare';
      rareExplain = 'very limited in number or exclusively made';
    }
    else if(this.props.rarity == 3) {
      rareTextClass = 'uniqueTextColor';
      rareText = 'unique';
      rareExplain = 'remarkably different and one of a kind';
    }
    var clusterPhotos = this.props.pictureUris.map((item, index) => {
        return (
          <div className="clusterPhoto" key={index}>
            <img src={'/uploads/'+item}/>
          </div>
        )
    });
     return (
      <div id="itemArea" className="clearFix">

        <div id="clusterPhotoColumn">
          <div id="clusterPhotoFeatured">
            <img src={'/uploads/'+this.props.mainPictureUri}/>
          </div>

          {clusterPhotos}
        </div>

        <div id="clusterInfoColumn">

          <div id="clusterTitle" className="rareItemIcon24px">
            {this.props.headline}
            <div id="clusterRarity">
                        <span id="clusterRarityTitle" className={rareTextClass}>
                          {rareText}
                        </span>
              <span id="clusterRarityDefinition">
                            : {rareExplain}
                        </span>
            </div>
          </div>

          <div id="clusterLocation">
            at at 605-0079 Kyoto-fu, Kyoto-shi, Higashiyama-ku, Tokiwacho (Yamatoojidori), 156-2
          </div>

          <div id="clusterCost" className="rareCostIcon18px">
            They cost between $40 - $400
          </div>

          <div id="clusterDetailsArea">
            {/*
            <div id="clusterSummary">
              "The Gion-shijo district of Kyoto is a place where the dead-eyed businessmen release whatever soul they
              have left with a constant flow of high quality fire water, which this merchant has ample supply of."
              <div id="clusterSummaryTags">
                <a href="index.html" className="linkUnderline linkTag">
                  #japanese
                </a>
                <a href="index.html" className="linkUnderline linkTag">
                  #whisky
                </a>
                <a href="index.html" className="linkUnderline linkTag">
                  #liquor
                </a>
                <a href="index.html" className="linkUnderline linkTag">
                  #Karuizawa
                </a>
                <a href="index.html" className="linkUnderline linkTag">
                  #delicious
                </a>
              </div>
            </div>
            */}
            <div id="userSignature">
              <div id="userSignaturePhoto">
                <a href="mymap.html">
                  <img src={"/images/users/" + this.props.userMainPictureUri} width="32" height="32"/>
                </a>
              </div>
              <div id="userSignatureNameTitle">
                <div id="userSignatureName">
                  -
                  <a href="mymap.html" className="linkUnderline">
                    {this.props.userName}
                  </a>
                </div>
                <div id="userSignatureTitle">
                  <a href="myMap.html" className="linkUnderline">
                    {this.props.bio}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {!this.props.isSubmitter ?
            <div id="requestButtonArea">
              <form>
                <button type="button" id="requestButton" className="rareRequestButton" onClick={this.props.requestItem}>
                  Request this Item
                </button>
              </form>
            </div>
            :
            <div id="requestButtonArea">
              <form>
                <button type="button" id="requestButton" className="rareRequestButton" onClick={this.props.removeItem}>
                  Remove this Item
                </button>
              </form>
            </div>
          }

          <div id="travelerList">
            <div id="travelerListTitle">
              Travelers in Japan are accepting requests!
            </div>

            <div id="travelerListSection">
              <div id="travelerListSectionPhoto">
                <a href="traveler.html">
                  <img src="images/users/ross_32px.jpg"/>
                </a>
              </div>
              <div id="travelerListSectionText">
                <div id="travelerListSectionTextName">
                  <a href="myMap.html" className="linkUnderline">
                    Ross Gibson
                  </a>
                </div>
                <div id="travelerListSectionTextNameTitle">
                  <a href="myMap.html" className="linkUnderline">
                    Shogun of Ardefact
                  </a>
                </div>
              </div>
            </div>

            <div id="travelerListSection">
              <div id="travelerListSectionPhoto">
                <a href="traveler.html">
                  <img src="images/users/lev_32px.jpg"/>
                </a>
              </div>
              <div id="travelerListSectionText">
                <div id="travelerListSectionTextName">
                  <a href="traveler.html" className="linkUnderline">
                    Lev Neiman
                  </a>
                </div>
                <div id="travelerListSectionTextNameTitle">
                  <a href="traveler.html" className="linkUnderline">
                    Wanderer of the Wastelands
                  </a>
                </div>
              </div>
            </div>

            <div id="travelerListSection">
              <div id="travelerListSectionPhoto">
                <a href="traveler.html">
                  <img src="images/users/david_32px.jpg"/>
                </a>
              </div>
              <div id="travelerListSectionText">
                <div id="travelerListSectionTextName">
                  <a href="traveler.html" className="linkUnderline">
                    David Wright-Spaner
                  </a>
                </div>
                <div id="travelerListSectionTextNameTitle">
                  <a href="traveler.html" className="linkUnderline">
                    some guy
                  </a>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

  )
  }
}