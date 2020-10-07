import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { logoutUser } from "../../actions/authActions";
import "./navstyle.css"

class Navbar extends Component {
  onLogoutClick = e => {
    e.preventDefault();
    this.props.logoutUser();
  };
  
  render() {
    return (
      <nav class="navbar navbar-light bg-light" id="nav">
        <a class="heading">MTG House Drafts</a>
        <form class="form-inline">
          <button onClick={this.onLogoutClick} class="btn btn-primary waves-effect waves-light hoverable accent-3" type="submit">Logout</button>
        </form>
      </nav>
    );
  }
}
Navbar.propTypes = {
  logoutUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};
const mapStateToProps = state => ({
  auth: state.auth
});
export default connect(
  mapStateToProps,
  { logoutUser }
)(Navbar);