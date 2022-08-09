import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  TextArea,
  Label,
  Form
} from 'semantic-ui-react'

import { createCar, deleteCar, getCars, patchCar } from '../api/cars-api'
import Auth from '../auth/Auth'
import { Car } from '../types/Car'

interface CarsProps {
  auth: Auth
  history: History
}

interface CarsState {
  cars: Car[]
  newCarName: string
  newCarMaker: string
  newCarModel: string
  loadingCars: boolean
}

export class Cars extends React.PureComponent<CarsProps, CarsState> {
  state: CarsState = {
    cars: [],
    newCarName: '',
    newCarMaker: '',
    newCarModel: '',
    loadingCars: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newCarName: event.target.value })
  }

  handleMakerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newCarMaker: event.target.value })
  }

  handleModelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newCarModel: event.target.value })
  }

  onEditButtonClick = (carId: string) => {
    this.props.history.push(`/cars/${carId}/edit`)
  }

  onCarCreate = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: any) => {
    try {
      const newCar = await createCar(this.props.auth.getIdToken(), {
        name: this.state.newCarName,
        carMaker: this.state.newCarMaker,
        model: this.state.newCarModel
      })
      this.setState({
        cars: [...this.state.cars, newCar],
        newCarName: '',
        newCarMaker: '',
        newCarModel: ''
      })
    } catch {
      alert('Car creation failed')
    }
  }

  onCarDelete = async (carId: string) => {
    try {
      await deleteCar(this.props.auth.getIdToken(), carId)
      this.setState({
        cars: this.state.cars.filter(car => car.carId !== carId)
      })
    } catch {
      alert('Car deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const cars = await getCars(this.props.auth.getIdToken())
      this.setState({
        cars,
        loadingCars: false
      })
    } catch (e) {
      alert(`Failed to fetch cars: ${(e as Error).message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">CARs</Header>

        {this.renderCreateCarInput()}

        {this.renderCars()}
      </div>
    )
  }

  renderCreateCarInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Label>Car Name</Label>
          <Input
            fluid
            placeholder="Car's Name"
            onChange={this.handleNameChange}
            value={this.state.newCarName}
          />
          <Divider />
        </Grid.Column>
        <Grid.Column width={16}>
          <Label>Car Maker</Label>
          <Input
            fluid
            placeholder="Car's maker"
            onChange={this.handleMakerChange}
            value={this.state.newCarMaker}
          />
          <Divider />
        </Grid.Column>
        <Grid.Column width={16}>
          <Label>Car Model</Label>
          <Input
            fluid
            placeholder="Car's model"
            onChange={this.handleModelChange}
            value={this.state.newCarModel}
          />
          <Divider />
        </Grid.Column>
        <Grid.Column width={16}>
          <Button icon='add' color='teal' onClick={this.onCarCreate}>Add new car</Button>
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderCars() {
    if (this.state.loadingCars) {
      return this.renderLoading()
    }

    return this.renderCarsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading cars
        </Loader>
      </Grid.Row>
    )
  }

  renderCarsList() {
    return (
      <Grid padded>
        {this.state.cars.map((car, pos) => {
          return (
            <Grid.Row key={car.carId}>
              <Grid.Column width={10} verticalAlign="middle">
                <Label>Name: {car.name} | Maker: {car.carMaker} | Model: {car.model}</Label>
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {car.carMaker}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(car.carId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onCarDelete(car.carId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {car.attachmentUrl && (
                <Image src={car.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
