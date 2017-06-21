var React = require('react');
import $ from 'jquery';

class ItemForm extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    console.log("Rendering Item form, god bless us....");

    return (
      <form action="/itemform" method="POST">

        <div id="itemFormOuterArea" className="clearFix">

          <div id="itemFormInnerArea">

            <div id="itemFormTitle">
              I found something!
            </div>

            {/* Item or Cluster */}

            <div className="itemFormRow">
              There's
              <input id="searchFilterClusters" type="radio" name="singleOrMultiple" value="multipleItems"
                     className="hideInput"/>
              <label htmlFor="searchFilterClusters" className="itemFormRadioButton">
                a bunch of stuff
              </label>
              <input id="searchFilterItems" type="radio" name="singleOrMultiple" value="singleItem"
                     className="hideInput"/>
              <label htmlFor="searchFilterItems" className="itemFormRadioButton">
                a thing
              </label>
            </div>

            {/* Name */}

            <div className="itemFormRow fillUpRowDiv">
              called
              <input id="itemFormInputName" name="name" className="universalTextFieldSettings fillUpRowInput"
                     type="text"
                     placeholder="a name"/>
            </div>

            {/* Location */}

            <div className="itemFormRow fillUpRowDiv">
              in
              <input id="itemFormInputLocation" name="location" className="universalTextFieldSettings fillUpRowInput"
                     type="text"
                     placeholder="a place"/>
            </div>

            {/* Cost */}

            <div className="itemFormRow fillUpRowDiv">
              and costs around
              <input id="itemFormInputCost" name="cost" className="universalTextFieldSettings fillUpRowInput"
                     type="text"
                     placeholder="a price"/>.
            </div>

            {/* URL */}

            <div className="itemFormRow fillUpRowDiv">
              You can find a good image of it at
              <input id="itemFormInputURL" name="imageUrl" className="universalTextFieldSettings fillUpRowInput"
                     type="text"
                     placeholder="a URL"/>.
            </div>

            {/* Rarity */}

            <div id="itemFormRarityArea">

              <div id="itemFormRarityAreaTitle">
                In terms of its rarity, it seems to be
              </div>
              <div>
                <input id="itemFormInputRarityUnique" type="radio" name="itemRarity" value="Unique"
                       className="hideInput"/>
                <label htmlFor="itemFormInputRarityUnique" className="itemFormCheckbox">Unique: remarkably different and
                  one of a kind</label>
              </div>
              <div>
                <input id="itemFormInputRarityRare" type="radio" name="itemRarity" value="Rare" className="hideInput"/>
                <label htmlFor="itemFormInputRarityRare" className="itemFormCheckbox">Rare: very limited in number or
                  exclusively made</label>
              </div>
              <div>
                <input id="itemFormInputRarityUncommon" type="radio" name="itemRarity" value="Uncommon"
                       className="hideInput"/>
                <label htmlFor="itemFormInputRarityUncommon" className="itemFormCheckbox">Uncommon: plenty from a
                  certain merchant or area</label>
              </div>
              <div>
                <input id="itemFormInputRarityRegional" type="radio" name="itemRarity" value="Regional"
                       className="hideInput"/>
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
    );
  }
}

export default ItemForm;
