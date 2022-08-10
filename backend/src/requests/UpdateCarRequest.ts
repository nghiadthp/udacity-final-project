/**
 * Fields in a request to update a single TODO item.
 */
export interface UpdateCarRequest {
  name: string
  carMaker: string
  model: string
  sellerEmail: string
  description: string
}