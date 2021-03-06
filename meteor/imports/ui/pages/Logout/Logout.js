import React from 'react';
import { Meteor } from 'meteor/meteor';
import Icon from '../../components/Icon/Icon';

import './Logout.scss';

class Logout extends React.Component {
  componentDidMount() {
    Meteor.logout();
  }

  render() {
    return (
      <div className="Logout">
        <img
          src=""
          alt="My Logo"
        />
        <h1>Stay safe out there.</h1>
        <p>{'Don\u0027t forget to like and follow dO2s elsewhere on the web:'}</p>
        <ul className="FollowUsElsewhere">
          <li><a href="#facebook-page"><Icon icon="facebook-official" /></a></li>
          <li><a href="https://twitter.com/dO2s_app"><Icon icon="twitter" /></a></li>
          <li><a href="https://github.com/upm-space/dO2s"><Icon icon="github" /></a></li>
        </ul>
      </div>
    );
  }
}

Logout.propTypes = {};

export default Logout;
