/**
 * Fields in a request to create a single TODO item.
 */
export interface CreateCarRequest {
  name: string
  carMaker: string
  model: string
  sellerEmail: string
  description: string
}
