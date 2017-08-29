import React from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import axios from 'axios';

class Panel extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      user: {},
      name: '',
      artist: '',
      album: '',
      song: '',
      query: {},
      songCount: '',
      listCount: '',
      songs: [],
      playlists: [],
      total: '',
      followers: 0
    }
  }

  componentDidMount() {
    $('#query').hide();
    axios({
      method: 'get',
      url: '/getTotal'
    })
    .then(response => {
      this.setState({name: this.props.match.params.name, total: response.data.total, followers: response.data.followers})
    })
    .catch(err => {
      console.log('Error getting total playlist count', err)
    })
  }

  handleTypingArtist(e) {
    this.setState({artist: e.target.value})
  }

  handleTypingSong(e) {
    this.setState({song: e.target.value})
  }

  handleTypingAlbum(e) {
    this.setState({album: e.target.value})
  }

  handleSubmit(e) {
    e.preventDefault();
    this.setState({songs: [], playlists: [], songCount: '', listCount: ''})
    var searchArtist = this.state.artist
    var searchSong = this.state.song
    var searchAlbum = this.state.album
    var search = {};

    if (searchArtist) {
      Object.assign(search, {}, {
        artist: searchArtist
      })
    }
    if (searchSong) {
      Object.assign(search, {}, {
        song: searchSong
      })
    }
    if (searchAlbum) {
      Object.assign(search, {}, {
        album: searchAlbum
      })
    }
    console.log('SEARCH', search)

    axios({
      method: 'post',
      url: '/retrieve',
      data: {
        search: search
      }
    })
    .then(response => {
      var songCount;
      var listCount;
      if (response.data.tracks.length) {
        songCount = response.data.tracks.length
      }
      if (response.data.playlists.length) {
        listCount = response.data.playlists.length
      }
      if (!listCount && !songCount) {
        listCount = '0'
      }
      this.setState({songs: response.data.tracks, playlists: response.data.playlists, songCount: songCount, listCount: listCount })
    })
    .catch(err => {
      console.log('Error fetching from Spotify', err)
    })

    this.setState({query: search})

    $('#query').show();
  }

  load() {
    axios({
      method: 'get',
      url: '/load'
    })
    .then(() => {
      console.log('Done loading')
    })
    .catch(err => {
      console.log('Error loading')
    })
  }

  round10(number, precision) {
    var factor = Math.pow(10, precision);
    var tempNumber = number * factor;
    var roundedTempNumber = Math.round(tempNumber);
    return roundedTempNumber / factor;
  };

  render() {
    var string = ""
    if (this.state.query.song && this.state.query.album) {
      string = "\"" + this.state.query.song + "\" from " + this.state.query.album + " by "
    } else if (this.state.query.song) {
      string = "\"" + this.state.query.song + "\" by "
    } else if (this.state.query.album) {
      string = this.state.query.album + " by "
    }
    return (
      <div>
        <div className="panel">
          <p className="textBody green">{"Logged in as " + this.state.name}</p>
          <form onSubmit={(e) => this.handleSubmit(e)}>
            <input
              type="text"
              className="text"
              name="artist"
              onChange={(e) => this.handleTypingArtist(e)}
              placeholder="Enter an artist"
              value={this.state.artist}
              required
            />
            <br/>
            <input
              type="text"
              className="text"
              name="song"
              onChange={(e) => this.handleTypingSong(e)}
              placeholder="Enter a song"
              value={this.state.song}
            />
            <text className="searchResult">  </text>
            <input
              type="text"
              className="text"
              name="album"
              onChange={(e) => this.handleTypingAlbum(e)}
              placeholder="Enter an album"
              value={this.state.album}
            />
            <br/>
            <button
              id="querySubmit"
              className="submit">
              Search
            </button>
          </form>
          <div id="query">
            <br/>
            <p className="result">
              <text>You searched for: </text>
              <text className="green">{string ? (string + this.state.query.artist) : this.state.query.artist}</text>
              <text> from a database of </text>
              <text className="green">{this.state.total}</text>
              <text> public Spotify playlists</text>
            </p>
            {this.state.songCount || this.state.listCount ?
              <div className="resultCountContainer">
                {
                  this.state.songCount ? <div className="resultCountBox">
                    {
                      this.state.songCount === 1 ?
                      <p className="searchResult green up">{"Found " + this.state.songCount + " song for this search"}</p> :
                      <p className="searchResult green up">{"Found " + this.state.songCount + " songs for this search"}</p>
                    }
                  </div> : null
                }
                {
                  this.state.listCount !== '' ? <div className="resultCountBox">
                    {
                      this.state.listCount === 1 ?
                      <p className="searchResult green up">{"Found " + this.state.listCount + " playlist (" + this.round10(this.state.listCount/this.state.total, 3) + "%) for this search"}</p> :
                      <p className="searchResult green up">{"Found " + this.state.listCount + " playlists (" + this.round10(this.state.listCount/this.state.total, 3) + "%) for this search"}</p>
                    }
                  </div> : null
                }
              </div>
              :
              <div>
                <div id="fountainG">
                  <div id="fountainG_1" className="fountainG"></div>
                  <div id="fountainG_2" className="fountainG"></div>
                  <div id="fountainG_3" className="fountainG"></div>
                  <div id="fountainG_4" className="fountainG"></div>
                  <div id="fountainG_5" className="fountainG"></div>
                  <div id="fountainG_6" className="fountainG"></div>
                  <div id="fountainG_7" className="fountainG"></div>
                  <div id="fountainG_8" className="fountainG"></div>
                </div>
                <div id="cssload-cupcake" className="cssload-box">
                  <span className="cssload-letter">L</span>
                  <div className="cssload-cupcakeCircle cssload-box">
                    <div className="cssload-cupcakeInner cssload-box">
                      <div className="cssload-cupcakeCore cssload-box">
                      </div>
                    </div>
                  </div>
                  <span className="cssload-letter cssload-box">A</span>
                  <span className="cssload-letter cssload-box">D</span>
                  <span className="cssload-letter cssload-box">I</span>
                  <span className="cssload-letter cssload-box">N</span>
                  <span className="cssload-letter cssload-box">G</span>
                </div>
              </div>
            }
            <div className="resultBox">
              {this.state.songs.length ?
                <div className="list">
                  <div className="headerBox">
                    <p className="listHeader">Songs</p>
                  </div>
                    {
                      this.state.songs.map((song, i) => {
                        return <div key={i} className="returnItem">
                          <text className="listItem">{song.t}</text><br/>
                          <div className="dropdown">
                            {
                              song.c.length === 1 ?
                              <button className="dropbtn">{"On " + song.c.length + " playlist"}</button> :
                              <button className="dropbtn">{"On " + song.c.length + " playlists"}</button>
                            }
                            <div className="dropdown-content">
                              {
                                song.c.map((playlist, j) => {
                                  return <a key={j}>
                                      <text className="listExtra">{playlist.n}</text><br/>
                                      <text className="position">{"Position: " + playlist.pos}</text><br/>
                                      <text className="position">{"Popularity: " + playlist.popu}</text>
                                    </a>
                                })
                              }
                            </div>
                          </div>
                        </div>
                      })
                    }
                </div>
                : null
              }
              {this.state.playlists.length ?
                <div className="list">
                  <div className="headerBox">
                    <p className="listHeader">Playlists</p>
                  </div>
                    {
                      this.state.playlists.map((list, i) => {
                        return <div key={i} className="returnItem">
                          <text className="listItem">{list.p}</text><br/>
                          <div className="dropdown">
                            {
                              list.e.length === 1 ?
                              <button className="dropbtn">{list.e.length + " match"}</button> :
                              <button className="dropbtn">{list.e.length + " matches"}</button>
                            }
                            <div className="dropdown-content">
                              {
                                list.e.map((song, j) => {
                                  return <a key={j}>
                                      <text className="listExtra">{song.n}</text><br/>
                                      <text className="position">{"Position: " + song.pos}</text><br/>
                                      <text className="position">{"Popularity: " + song.popu }</text>
                                    </a>
                                })
                              }
                            </div>
                          </div>
                        </div>
                      })
                    }
                </div>
                : null
              }
            </div>
          </div>
          <br/>
          <button
            className="submit smaller"
            onClick={() => this.load()}>
            Download Playlist Data (once)
          </button>
        </div>
        <Link to="/home">
          <text className="btn login home">
            Home
          </text>
        </Link>
        <Link to={"/info/" + this.state.name}>
          <text className="btn login home">
            Info
          </text>
        </Link>
      </div>
    );
  }
};

Panel.propTypes = {

};


export default withRouter(Panel);
