import React, { Component, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../../actions/authActions";
import AddPlayer from "../../components/AddPlayer"
class Dashboard extends Component {
  onLogoutClick = e => {
    e.preventDefault();
    this.props.logoutUser();
  };

render() {
    const { user } = this.props.auth;
return (
      <div style={{ height: "75vh" }} className="container">
        <div className="row">
          <div className="col s12 center-align">
            <h4>
              <b>Logged in as</b> {user.name}
              <p className="flow-text grey-text text-darken-1">
                Welcome to MTG House Drafts
              </p>
            </h4>
          <AddPlayer
          user={this.props.auth.user.id}
          />
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