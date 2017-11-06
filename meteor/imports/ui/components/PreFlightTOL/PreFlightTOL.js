import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import { Button, Row, Col, FormGroup, ControlLabel, HelpBlock } from 'react-bootstrap';
import PreFlightMap from '../PreFlightMap/PreFlightMap';
import getElevation from '../../../modules/mission-planning/get-elevation';
import validate from '../../../modules/validate';

class PreFlightTOL extends Component {
  constructor(props) {
    super(props);
    this.toogleButtonSwtich = this.toggleButtonSwitch.bind(this);
    this.setTakeOffPoint = this.setTakeOffPoint.bind(this);
    this.setLandingPoint = this.setLandingPoint.bind(this);
    this.editWayPointList = this.editWayPointList.bind(this);
    this.calculateElevation = this.calculateElevation.bind(this);
    this.checkLimit = this.checkLimit.bind(this);

    this.state = {
      isClockWise: false,
      segmentSizeOverLimit: false,
      landingBearing: 0,
      buttonStates: {
        getAngleActive: false,
      },
    };
  }

  componentDidMount() {
    this.props.getPath(this.props.match.path.split('/').pop());
    const component = this;
    validate(component.form, {
      rules: {
        segmentSize: {
          required: true,
          max: 500,
        },
      },
      messages: {
        overlap: {
          required: 'The overlap for the pictures',
        },
        sidelap: {
          required: 'The overlap for the pictures',
        },
      },
      submitHandler() { component.handleSubmit(); },
    });
  }

  setTakeOffPoint(takeOffPoint = 0) {
    if (takeOffPoint !== 0) {
      Meteor.call('missions.setTakeOffPoint', this.props.mission._id, takeOffPoint, (error) => {
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          Bert.alert('Take Off Point Set', 'success');
        }
      });
    } else {
      Bert.alert('No take off point reading', 'danger');
    }
  }

  setLandingPoint(landingPoint = 0) {
    if (landingPoint !== 0) {
      Meteor.call('missions.setLandingPoint', this.props.mission._id, landingPoint, (error) => {
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          Bert.alert('Landing Point Set', 'success');
        }
      });
    } else {
      Bert.alert('No lading point reading', 'danger');
    }
  }

  checkLimit(newSegmentSize) {
    this.setState({ segmentSizeOverLimit: newSegmentSize > 500 });
  }

  changeDirection(newValue) {
    this.setState({ isClockWise: newValue });
  }

  toggleButtonSwitch(thisButton = '') {
    this.setState((prevState) => {
      const myButtons = Object.keys(prevState.buttonStates);
      const newButtonStates = prevState.buttonStates;
      for (let i = 0; i < myButtons.length; i += 1) {
        if (thisButton !== myButtons[i]) {
          if (prevState.buttonStates[myButtons[i]]) {
            newButtonStates[myButtons[i]] = false;
          }
        }
      }
      if (thisButton) {
        newButtonStates[thisButton] = !prevState.buttonStates[thisButton];
      }
      return { buttonStates: newButtonStates };
    });
  }

  calculateElevation() {
    const doWaypointsExist = this.props.mission.flightPlan &&
     this.props.mission.flightPlan.missionCalculation &&
     this.props.mission.flightPlan.missionCalculation.waypointList;
    const isHeightDefined = this.props.mission.flightPlan &&
      this.props.mission.flightPlan.flightParameters &&
      this.props.mission.flightPlan.flightParameters.height;
    if (!doWaypointsExist) {
      Bert.alert('You need to draw the mission', 'danger');
      return;
    } else if (!isHeightDefined) {
      Bert.alert('You need to define the Flight Height', 'danger');
      return;
    }
    this.toogleButtonSwtich();
    getElevation(this.props.mission._id, isHeightDefined, doWaypointsExist);
  }

  editWayPointList(newWayPointList = {}) {
    Meteor.call('missions.editWayPointList', this.props.mission._id, newWayPointList, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else if (newWayPointList) {
        Bert.alert('Mission Waypoints Updated', 'success');
      } else {
        Bert.alert('You should not get here ever', 'danger');
      }
    });
  }

  render() {
    const {
      mission, project, match, history,
    } = this.props;
    return (
      <div className="TOL">
        <h4>Fix Take Off and Landing Points. Set Landing path.</h4>
        <Row>
          <Col xs={12} sm={3} md={3} lg={3}>
            <Row>
              <Col xs={12} sm={12} md={12} lg={12}>
                <Button
                  onClick={() => this.setTakeOffPoint()}
                  block
                  bsStyle="primary"
                >
                    Set Take Off Point
                </Button>
              </Col>
            </Row>
            <br />
            <Row>
              <Col xs={12} sm={12} md={12} lg={12}>
                <Button
                  onClick={() => this.setLandingPoint()}
                  block
                  bsStyle="primary"
                >
                  Set Landing Point
                </Button>
              </Col>
            </Row>
            <br />
            <Row>
              <Col xs={12} sm={12} md={12} lg={12}>
                <FormGroup
                  validationState={this.state.segmentSizeOverLimit ? 'warning' : null}
                >
                  <ControlLabel>Max Distance From Pilot (m)</ControlLabel>
                  <input
                    type="number"
                    className="form-control"
                    name="segmentSize"
                    ref={segmentSize => (this.segmentSize = segmentSize)}
                    defaultValue={500}
                    onChange={() => this.checkLimit(Number(this.segmentSize.value))}
                  />
                  {this.state.segmentSizeOverLimit ?
                    <HelpBlock>Legal limit is 500 m</HelpBlock> : ''}
                </FormGroup>
              </Col>
            </Row>
            <Row style={{ verticalAlign: 'middle' }}>
              <Col xs={12} sm={12} md={12} lg={12}>
                <FormGroup>
                  <input
                    type="checkbox"
                    className="form-check-input large"
                    name="isClockWise"
                    ref={isClockWise => (this.isClockWise = isClockWise)}
                    checked={this.state.isClockWise}
                    onChange={() => this.changeDirection(this.isClockWise.checked)}
                  />
                  {' '}
                  <ControlLabel>ClockWise</ControlLabel>
                  {this.state.segmentSizeOverLimit ?
                    <HelpBlock>Legal limit is 500 m</HelpBlock> : ''}
                </FormGroup>
              </Col>
              <Col xs={12} sm={12} md={12} lg={12}>
                <Button block bsStyle="default">Set Landing Bearing</Button>
              </Col>
            </Row>
            <br />
            <Row>
              <Col xs={12} sm={12} md={12} lg={12}>
                <Button block bsStyle="primary">Set Landing Path</Button>
              </Col>
            </Row>
            <br />
            <Row>
              <Col xs={12} sm={12} md={12} lg={12}>
                <Button block bsStyle="info">Send Waypoints</Button>
              </Col>
            </Row>
            <br />
            <Row>
              <Col xs={12} sm={12} md={12} lg={12}>
                <Button block bsStyle="info">Read Waypoints</Button>
              </Col>
            </Row>
            <br />
            <Row>
              <Col xs={12} sm={12} md={12} lg={12}>
                <Button
                  bsStyle="success"
                  onClick={() => history.push(`/projects/${match.params.project_id}/${match.params.mission_id}/preflight/checklist`)}
                  block
                >
              Go to PreFlight<br /> Systems Check
                </Button>
              </Col>
            </Row>
          </Col>
          <Col xs={12} sm={9} md={9} lg={9}>
            <PreFlightMap
              location={project && project.mapLocation}
              mission={mission}
              height="70vh"
            />
          </Col>
        </Row>
      </div>
    );
  }
}
PreFlightTOL.propTypes = {
  mission: PropTypes.object.isRequired,
  project: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  getPath: PropTypes.func.isRequired,
};

export default PreFlightTOL;