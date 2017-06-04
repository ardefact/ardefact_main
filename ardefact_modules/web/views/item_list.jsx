var React = require('react');
import $ from 'jquery';
import Cookies from '../lib/js.cookie-2.1.4.min';

class ItemListForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    var state = this.state;
    state[event.target.id] = event.target.value;
    this.setState(state);
  }

  handleSubmit(event) {
    event.preventDefault();
    alert(this.state);
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
      <div id="itemFormOuterArea" class="clearFix">

        <div id="itemFormInnerArea">

          <div id="itemFormTitle">
            I found something!
          </div>

          <div class="itemFormRow">
            There's
            <input id="searchFilterClusters" type="radio" name="SingleOrMultipleItems" value="multipleItems" class="hideInput" />
            <label for="searchFilterClusters" class="itemFormRadioButton">
              a bunch of stuff
            </label>
            <input id="searchFilterItems" type="radio" name="SingleOrMultipleItems" value="singleItem" class="hideInput" />
            <label for="searchFilterItems" class="itemFormRadioButton">
              a thing
            </label>
          </div>

          <div class="itemFormRow">
            called
            <input id="itemFormInputName" name="itemFormInputName" class="universalTextFieldSettings" type="text" placeholder="a name" />
          </div>

          <div class="itemFormRow">
            in
            <input id="itemFormInputLocation" name="itemFormInputLocation" class="universalTextFieldSettings" type="text" placeholder="a place" />
          </div>

          <div class="itemFormRow">
            and costs around
            <input id="itemFormInputCost" name="itemFormInputCost" class="universalTextFieldSettings" type="text" placeholder="a price" />.
          </div>

          <div class="itemFormRow">
            You can find a good image of it at
            <input id="itemFormInputURL" name="itemFormInputURL" class="universalTextFieldSettings" type="text" placeholder="a URL" />.
          </div>

          <div id="itemFormRarityArea">

            <div id="itemFormRarityAreaTitle">
              In terms of its rarity, it seems to be
            </div>
            <div>
              <input id="itemFormInputRarityUnique" type="radio" name="itemRarity" value="Unique" class="hideInput" />
              <label for="itemFormInputRarityUnique" class="itemFormCheckbox">Unique: remarkably different and one of a kind</label>
            </div>
            <div>
              <input id="itemFormInputRarityRare" type="radio" name="itemRarity" value="Rare" class="hideInput" />
              <label for="itemFormInputRarityRare" class="itemFormCheckbox">Rare: very limited in number or exclusively made</label>
            </div>
            <div>
              <input id="itemFormInputRarityUncommon" type="radio" name="itemRarity" value="Uncommon" class="hideInput" />
              <label for="itemFormInputRarityUncommon" class="itemFormCheckbox">Uncommon: plenty from a certain merchant or area</label>
            </div>
            <div>
              <input id="itemFormInputRarityRegional" type="radio" name="itemRarity" value="Regional" class="hideInput" />
              <label for="itemFormInputRarityRegional" class="itemFormCheckbox">Regional: plenty throughout the entire region</label>
            </div>

          </div>

          <div id="foundButtonArea">
              <button type="submit" id="moreButton" name="itemSubmitButton">
                Add It To The Catalog
              </button>
          </div>

        </div>

      </div>
      </form>
    );
  }
}

export default ItemListForm;
