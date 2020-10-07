import React, { Component, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../../actions/authActions";
class Dashboard extends Component {
  onLogoutClick = e => {
    e.preventDefault();
    this.props.logoutUser();
  };
  constructor() {
    super();
    this.state = {
      playerForm: "",
      players: [],
    };
  }
  onChange = e => {
    this.setState({ [e.target.id]: e.target.value });
  };
  addPlayer = e =>{
    e.preventDefault();
    this.state.players=[...this.state.players, this.state.playerForm];
    this.setState({playerForm: ""})
    console.log(this.state.players)
  }

render() {
    const { user } = this.props.auth;
return (
      <div style={{ height: "75vh" }} className="container valign-wrapper">
        <div className="row">
          <div className="col s12 center-align">
            <h4>
              <b>Hello,</b> {user.name}
              <p className="flow-text grey-text text-darken-1">
                Welcome to MTG House Drafts
              </p>
            </h4>
            <label htmlFor="PlayerForm">Enter Player Name</label>
            <input
                  onChange={this.onChange}
                  value={this.state.playerForm}
                  id="playerForm"
                  type="text"
                />
                {this.state.players.length < 6 && <span>Must have at least 6 players</span>}
                {this.state.players.length > 10 && <span>Maximum is 10 players</span>}
                <button
                  style={{
                    width: "150px",
                    borderRadius: "3px",
                    letterSpacing: "1.5px",
                    marginTop: "1rem"
                  }}
                  onClick={this.addPlayer}
                  type="submit"
                  className="btn btn-large waves-effect waves-light hoverable blue accent-3"
                >
                  Add Player
                </button>
                {this.state.players.map((player, i) => <p key={i}>{player}</p>)}

          </div>
        </div>
      </div>
    );
  }
}
Dashboard.propTypes = {
  logoutUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};
const mapStateToProps = state => ({
  auth: state.auth
});
export default connect(
  mapStateToProps,
  { logoutUser }
)(Dashboard);