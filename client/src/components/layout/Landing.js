import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Dashboard from "../dashboard/Dashboard"


class Landing extends Component {
  render() {
    const loggedIn=(this.props.auth.isAuthenticated)
    return (<>
      {loggedIn ? <Dashboard/> :
      <div style={{ height: "75vh" }} className="container">
        <div className="row">
          <div className="col s12 center-align">
            <h3>
            Manage your unsanctioned play groups and keep track of who is winning
            </h3>
            <p className="flow-text grey-text text-darken-1">
              Create an account to get started or log in
            </p>
            <br />
            <div className="col s4">
              <Link
                to="/register"
                style={{
                  width: "140px",
                  borderRadius: "3px",
                  letterSpacing: "1.5px"
                }}
                className="btn btn-primary waves-effect waves-light hoverable accent-3"
              >
                Register
              </Link>
            </div>
            <div className="col s4">
              <Link
                to="/login"
                style={{
                  width: "140px",
                  borderRadius: "3px",
                  letterSpacing: "1.5px"
                }}
                className="btn btn-primary waves-effect waves-light hoverable accent-3"
              >
                Log In
              </Link>
            </div>
          </div>
        </div>
      </div>
      }
      </>
    );
  }
}
Landing.propTypes = {
  auth: PropTypes.object.isRequired
};
const mapStateToProps = state => ({
  auth: state.auth
});
export default connect(
  mapStateToProps
)(Landing);