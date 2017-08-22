import React from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <p className="textBody">
        Welcome! Log in with <text style={{'color': '#84bd00'}}>Spotify</text> to start analyzing.
      </p>
      <a href="/login" className="btn login">
      Log in with <text style={{'color': '#84bd00'}}>Spotify</text>
    </a>
    <br/>
  </div>
);
};

Home.propTypes = {

};


export default withRouter(Home);
