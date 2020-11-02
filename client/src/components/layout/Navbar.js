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
    console.log(this.props)
    const userId=this.props.auth.user.id
    return (
      <nav className="navbar navbar-light bg-light" id="nav">
        {this.props.auth.isAuthenticated &&
        <>
        <li>
            <Link to={"/saveddrafts/" + userId} className="nav-item">Your Drafts</Link>
            </li>
            <li>
            <Link to="/" className="nav-item">Leaderboard</Link>
            </li>
            </>
        }
        <a className="heading">MTG House Drafts</a>
        <form className="form-inline">
          {this.props.auth.isAuthenticated &&
          <button onClick={this.onLogoutClick} className="btn btn-primary waves-effect waves-light hoverable accent-3" type="submit">Logout</button>}
        </form>
      </nav>
    );
  }s
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