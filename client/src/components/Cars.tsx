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
  Form,
  Dropdown,
  DropdownProps,
  Item
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
  newCarMaker?: string
  newCarModel?: string
  newCarSellerEmail: string
  newDescription: string
  loadingCars: boolean

  requireCarName: string
  requireCarMaker: string
  requireCarModel: string
  requireCarSellerEmail: string
  invalidCarSellerEmail: string
}

const requireCarNameMessage = 'Please enter a car name!'
const requireCarMakerMessage = 'Please select a car maker!'
const requireCarModelMessage = 'Please select a car model!'
const requireSellerEmailMessage = 'Please enter seller email'
const invalidSellerEmailMessage = 'Please enter valid email'

const validEmail = new RegExp(/\S+@\S+\.\S+/);

const carMakerOptions = [
  { key: 1, text: 'BMW', value: "BMW" },
  { key: 2, text: 'Honda', value: 'Honda' },
  { key: 3, text: 'Mazda', value: 'Mazda' },
  { key: 4, text: 'Toyota', value: 'Toyota' },
  { key: 5, text: 'Hyundai', value: 'Hyundai' },
  { key: 6, text: 'Ford', value: 'Ford' },
  { key: 7, text: 'Kia', value: 'Kia' },
  { key: 8, text: 'Tesla', value: 'Tesla' },
  { key: 9, text: 'Chevrolet', value: 'Chevrolet' },
  { key: 10, text: 'Lexus', value: 'Lexus' },
]

const carModelOptions = [
  { key: 1, text: 'Hatchback', value: "Hatchback" },
  { key: 2, text: 'Sedan', value: 'Sedan' },
  { key: 3, text: 'SUV', value: 'SUV' },
  { key: 4, text: 'Crossover', value: 'Crossover' },
  { key: 5, text: 'MPV', value: 'MPV' }
]


export class Cars extends React.PureComponent<CarsProps, CarsState> {
  state: CarsState = {
    cars: [],
    newCarName: '',
    newCarMaker: '',
    newCarModel: '',
    newCarSellerEmail: '',
    newDescription: '',
    loadingCars: true,

    requireCarName: '',
    requireCarMaker: '',
    requireCarModel: '',
    requireCarSellerEmail: '',
    invalidCarSellerEmail: ''
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newCarName: event.target.value, requireCarName: event.target.value.trim() === '' ? requireCarNameMessage : '' })
  }

  handleMakerChange = (event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
    this.setState({ newCarMaker: data.value?.toString(), requireCarMaker: data.value?.toString().trim() === '' ? requireCarMakerMessage : '' })
  }

  handleModelChange = (event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
    this.setState({ newCarModel: data.value?.toString(), requireCarModel: data.value?.toString().trim() === '' ? requireCarModelMessage : '' })
  }

  handleSellerEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newCarSellerEmail: event.target.value, requireCarSellerEmail: event.target.value.trim() === '' ? requireSellerEmailMessage : '' })
    debugger;
    if (!validEmail.test(event.target.value)) {
      this.setState({ invalidCarSellerEmail: invalidSellerEmailMessage });
    }
    else {
      this.setState({ invalidCarSellerEmail: '' });
    }
  }

  handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ newDescription: event.target.value })
  }

  onEditButtonClick = (carId: string) => {
    this.props.history.push(`/cars/${carId}/edit`)
  }

  onCarCreate = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: any) => {
    try {
      this.setState({ requireCarName: '', requireCarModel: '', requireCarMaker: '', newCarSellerEmail: '' })
      let error: boolean = false;
      if (this.state.newCarName.trim() == '') {
        this.setState({ requireCarName: requireCarNameMessage })
        error = true;
      }

      if (this.state.newCarModel == '') {
        this.setState({ requireCarModel: requireCarModelMessage })
        error = true;
      }

      if (this.state.newCarMaker == '') {
        this.setState({ requireCarMaker: requireCarMakerMessage })
        error = true;
      }

      if (this.state.newCarSellerEmail == '') {
        this.setState({ requireCarSellerEmail: requireSellerEmailMessage })
        error = true;
      }

      if (!validEmail.test(this.state.newCarSellerEmail)) {
        this.setState({ invalidCarSellerEmail: invalidSellerEmailMessage });
        error = true;
      }

      if (error) {
        return;
      }

      const newCar = await createCar(this.props.auth.getIdToken(), {
        name: this.state.newCarName,
        carMaker: this.state.newCarMaker ?? "",
        model: this.state.newCarModel ?? "",
        sellerEmail: this.state.newCarSellerEmail,
        description: this.state.newDescription,
      })

      this.setState({
        cars: [...this.state.cars, newCar],
        newCarName: '',
        newCarMaker: '',
        newCarModel: '',
        newCarSellerEmail: '',
        newDescription: '',

        requireCarName: '',
        requireCarMaker: '',
        requireCarModel: '',
        requireCarSellerEmail: '',
        invalidCarSellerEmail: ''
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
        <Header as="h1">Cars Management</Header>

        {this.renderCreateCarInput()}

        {this.renderCars()}
      </div>
    )
  }

  renderCreateCarInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <label><b>Car Name</b></label>
          <Input
            fluid
            placeholder="Car's Name"
            onChange={this.handleNameChange}
            value={this.state.newCarName}
          />
          <Label basic color='red' pointing className={this.state.requireCarName === '' ? 'displaynone' : ""}>
            {this.state.requireCarName}
          </Label>
          <Divider />
        </Grid.Column>
        <Grid.Column>
          <label><b>Car Maker</b></label>
          <Form.Field>
            <Dropdown
              selectOnNavigation={false}
              className="ui primary"
              onChange={this.handleMakerChange}
              clearable
              options={carMakerOptions}
              selection
              placeholder='Select car maker'
              fluid
            />
            <Label basic color='red' pointing className={this.state.requireCarMaker === '' ? 'displaynone' : ""}>
              {this.state.requireCarMaker}
            </Label>
          </Form.Field>
          <Divider />
        </Grid.Column>
        <Grid.Column>
          <label><b>Car Model</b></label>
          <Form.Field>
            <Dropdown
              selectOnNavigation={false}
              className="ui primary"
              onChange={this.handleModelChange}
              clearable
              options={carModelOptions}
              selection
              placeholder='Select car model'
              fluid
            />
            <Label basic color='red' pointing className={this.state.requireCarModel === '' ? 'displaynone' : ""}>
              {this.state.requireCarModel}
            </Label>
          </Form.Field>
          <Divider />
        </Grid.Column>
        <Grid.Column width={16}>
          <label><b>Seller Email</b></label>
          <Input
            fluid
            placeholder="Seller Email"
            onChange={this.handleSellerEmailChange}
            value={this.state.newCarSellerEmail}
          />
          <Label basic color='red' pointing className={this.state.requireCarSellerEmail === '' ? 'displaynone' : ""}>
            {this.state.requireCarSellerEmail}
          </Label>
          <Label basic color='red' pointing className={this.state.invalidCarSellerEmail === '' ? 'displaynone' : ""}>
            {this.state.invalidCarSellerEmail}
          </Label>
          <Divider />
        </Grid.Column>

        <Grid.Column width={16}>
          <label><b>Description</b></label>
          <Form>
            <TextArea placeholder="Car's description"
              onChange={this.handleDescriptionChange}
              value={this.state.newDescription} />
          </Form>
          <Divider />
        </Grid.Column>

        <Grid.Column width={16}>
          <Button icon='add' color='teal' content='Add new car' onClick={this.onCarCreate} />
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
      <Item.Group padded>
        {this.state.cars.map((car, pos) => {
          return (
            <Item>
              {car.attachmentUrl != '' && car.attachmentUrl != undefined ? (
                <Item.Image src={car.attachmentUrl} />
                // <Item.Image src="https://react.semantic-ui.com/images/wireframe/image.png"/>
              ) :
                (
                  <Item.Image src="https://react.semantic-ui.com/images/wireframe/image.png" />
                )}
              <Item.Content>
                <Item.Header as='a'>{car.name}</Item.Header>
                <Item.Meta>
                  <span className='cinema'>{car.sellerEmail}</span>
                </Item.Meta>
                <Item.Description>{car.description}</Item.Description>
                <Item.Extra>
                  <Button floated='right' icon color="red" onClick={() => this.onCarDelete(car.carId)} >
                    <Icon name="delete" />
                  </Button>
                  <Button floated='right' icon color="blue" onClick={() => this.onEditButtonClick(car.carId)} >
                    <Icon name="upload" />
                  </Button>

                  <Label>{car.model}</Label>
                  <Label>{car.carMaker}</Label>
                </Item.Extra>
              </Item.Content>
            </Item>
          )
        })}
      </Item.Group>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
