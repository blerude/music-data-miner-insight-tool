import React from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';

class Info extends React.Component {
  constructor(props) {
    super(props)
    this.state ={
      name: ''
    }
  }

  componentDidMount() {
    this.setState({name: this.props.match.params.name})
  }

  render() {
    return (
      <div>
        <div className="panel">
          <p className="result left">This is information about my app</p>

        </div>
        <Link to="/home">
          <text className="btn login home">
            Home
          </text>
        </Link>
        <Link to={"/panel/"+this.state.name}>
          <text className="btn login home">
            Panel
          </text>
        </Link>
      </div>
    );
  }
};

Info.propTypes = {

};


export default withRouter(Info);
