/**
 * TODO: remove this at some point, since this just displays user submission
 * from hacky itemform which are not real items
 */
var React = require('react');
var _     = require('lodash');

import ReactTable from 'react-table'
import {Link} from 'react-router-dom';
import $ from 'jquery';

import Result from './Result.jsx';

class ItemList extends React.Component {
  constructor(props) {
    super(props)

    const self = this;
    this.state = {rows: [], error: ""};
  }

  componentDidMount() {
    $.get(
      {
        url     : '/api/item_list',
        success : (data, textStatus, response) => {
          this.setState(
            {
              rows  : data,
              error : ""
            }
          )
        },
        error   : function (error) {
          this.setState(
            {
              rows  : [],
              error : error,
            });
        }
      }
    );
  }

  render() {
    if (this.state.error) {
      alert(JSON.stringify(this.state.error, 1, 1));
    }

    if (this.state.rows === undefined) {
      return (
        <div>
          <div id="itemFormOuterArea">
            <div id="itemFormInnerArea">
              Loading...
            </div>
          </div>
        </div>
      );
    }

    var rows = this.state.rows.map((item, index) => {
      console.log(item)
      let uri = '';
      if(item.hasOwnProperty('main_picture')) {
       uri =  item.main_picture.uris.full;
      }
      return <Result key={index} uri={uri} headline={item.headline} location="dfkdjf" price="kgfskdgfj" isCluster={item.is_cluster} id={item._id}/>
    });

    return (
      <div id="searchResultsArea" className="clearFix">
        {rows}
      </div>
    );
  }

}

export default ItemList;
