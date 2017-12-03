import React from 'react';
import {Link} from 'react-router-dom';

export default class Result extends React.Component {
  render() {
    console.log(this.props.isCluster)

    var headlineIconClassName = this.props.isCluster ? "searchResultClusterName rareClusterIcon16px" : "searchResultItemName regionalItemIcon16px";
    var link = '/item/' + this.props.id;
    return (
      <div className="searchResult">
        <div className="searchResultImage">
          <a href={link}>
            <img src={'uploads/' + this.props.uri}/>
          </a>
        </div>
        <div className="searchResultDetails">
          <div className={headlineIconClassName}>
            <Link to={link} className="linkUnderline">
              {this.props.headline}
            </Link>
          </div>
          <div className="searchResultLocation">
            in
            <a href={link} className="linkUnderline">
              {this.props.location}
            </a>
          </div>
          <div className="searchResultClusterTags">
            #tag #tag #tag #tag #tag
          </div>
        </div>
      </div>
    )
  }
}
