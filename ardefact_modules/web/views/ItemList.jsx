/**
 * TODO: remove this at some point, since this just displays user submission
 * from hacky itemform which are not real items
 */
var React = require('react');
var _     = require('lodash');

import ReactTable from 'react-table'
import {Link} from 'react-router-dom';
import $ from 'jquery';

class ItemList extends React.Component {
  constructor(props) {
    super(props)

    const self = this;
    this.state = {};

    $.post(
      {
        url     : '/item_list',
        success : function (data, textStatus, response) {
          self.setState(
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
        <div id="itemFormOuterArea">
          <div id="itemFormInnerArea">
            Loading...
          </div>
        </div>
      );
    }

    var row_i = 0;

    var rows = _.map(
      this.state.rows,
      row => (
        <div style={{whiteSpace : "pre-wrap"}} key={row_i++}>
          {JSON.stringify(row, 1, 1)}
        </div>
      )
    );

    return (
      <div id="itemFormOuterArea">
        <div id="itemFormInnerArea">
          {rows}
        </div>
      </div>
    );
  }

}

export default ItemList;
