import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { HashRouter, Link, Route, withRouter } from 'react-router-dom';
import { Switch } from 'react-router';
import Title from '../components/Title';
import Login from '../components/Login';
import Info from '../components/Info';
import Home from '../components/Home';
import Panel from '../components/Panel';
import axios from 'axios'

class AppContainer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      login: false
    }
  }

  componentDidMount() {
    this.loginClick();
  }

  loginClick() {
    // axios({
    //   method: 'get',
    //   url: 'http://localhost:3000/checkUser'
    // })
    // .then(response => {
    //   if (response.data) {
    //     this.setState({login: true})
    //   } else {
    //     this.setState({login: false})
    //   }
    // })
    // .catch(err => {
    //   console.log('Error fetching doc', err)
    // })
  }

  render() {
    return (
      <HashRouter>
        <div className="container">
          <div className="main">
            <Title name={this.props.name} />
            <Switch>
              <Route path="/home" component={Home} />
              <Route path="/info/:name" component={Info} />
              <Route path="/panel/:name" component={Panel} />
              <Route component={Home}/>
            </Switch>
          </div>
        </div>
      </HashRouter>
    );
  }
};

AppContainer.propTypes = {
  name: PropTypes.string,
};

const mapStateToProps = (state) => {
  return {
    name: state.name
  };
};

const mapDispatchToProps = (/* dispatch */) => {
  return {
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AppContainer);





{/* <script id="user-profile-template" type="text/x-handlebars-template">
<h1>Logged in as {{display_name}}</h1>
<div class="media">
<div class="pull-left">
<img class="media-object" width="150" src="{{images.0.url}}" />
</div>
<div class="media-body">
<dl class="dl-horizontal">
<dt>Display name</dt><dd class="clearfix">{{display_name}}</dd>
<dt>Id</dt><dd>{{id}}</dd>
<dt>Email</dt><dd>{{email}}</dd>
<dt>Spotify URI</dt><dd><a href="{{external_urls.spotify}}">{{external_urls.spotify}}</a></dd>
<dt>Link</dt><dd><a href="{{href}}">{{href}}</a></dd>
<dt>Profile Image</dt><dd class="clearfix"><a href="{{images.0.url}}">{{images.0.url}}</a></dd>
<dt>Country</dt><dd>{{country}}</dd>
</dl>
</div>
</div>
</script>

<script id="oauth-template" type="text/x-handlebars-template">
<h2>oAuth info</h2>
<dl class="dl-horizontal">
<dt>Access token</dt><dd class="text-overflow">{{access_token}}</dd>
<dt>Refresh token</dt><dd class="text-overflow">{{refresh_token}}></dd>
</dl>
</script> */}

// {/* <script>
//   (function() {
//     /**
//      * Obtains parameters from the hash of the URL
//      * @return Object
//      */
//     function getHashParams() {
//       var hashParams = {};
//       var e, r = /([^&;=]+)=?([^&;]*)/g,
//           q = window.location.hash.substring(1);
//       while ( e = r.exec(q)) {
//          hashParams[e[1]] = decodeURIComponent(e[2]);
//       }
//       return hashParams;
//     }
//
//     var userProfileSource = document.getElementById('user-profile-template').innerHTML,
//         userProfileTemplate = Handlebars.compile(userProfileSource),
//         userProfilePlaceholder = document.getElementById('user-profile');
//
//     var oauthSource = document.getElementById('oauth-template').innerHTML,
//         oauthTemplate = Handlebars.compile(oauthSource),
//         oauthPlaceholder = document.getElementById('oauth');
//
//     var params = getHashParams();
//
//     var access_token = params.access_token,
//         refresh_token = params.refresh_token,
//         error = params.error;
//
//     if (error) {
//       alert('There was an error during the authentication');
//     } else {
//       if (access_token) {
//         // render oauth info
//         oauthPlaceholder.innerHTML = oauthTemplate({
//           access_token: access_token,
//           refresh_token: refresh_token
//         });
//
//         $.ajax({
//             url: 'https://api.spotify.com/v1/me',
//             headers: {
//               'Authorization': 'Bearer ' + access_token
//             },
//             success: function(response) {
//               userProfilePlaceholder.innerHTML = userProfileTemplate(response);
//
//               $('#login').hide();
//               $('#loggedin').show();
//             }
//         });
//       } else {
//           // render initial screen
//           $('#login').show();
//           $('#loggedin').hide();
//       }
//
//       document.getElementById('obtain-new-token').addEventListener('click', function() {
//         $.ajax({
//           url: '/refresh_token',
//           data: {
//             'refresh_token': refresh_token
//           }
//         }).done(function(data) {
//           access_token = data.access_token;
//           oauthPlaceholder.innerHTML = oauthTemplate({
//             access_token: access_token,
//             refresh_token: refresh_token
//           });
//         });
//       }, false);
//     }
//   })();
// </script> */}
