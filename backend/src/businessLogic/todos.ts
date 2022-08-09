import { TodosAccess } from '../helpers/todosAcess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { parseUserId } from '../auth/utils'

const logger = createLogger('businessLogic_todos')
const todosAccess = new TodosAccess()

export async function getTodosByUserId(userId: string): Promise<TodoItem[]> {
    logger.info('get todo user by id - ' + userId);
    return todosAccess.getTodosByUserId(userId)
}

export const getSignedUploadUrl = async (todoId: string, userId: string): Promise<string> => {
    return todosAccess.getSignedUploadUrl(todoId, userId)
}

export const createTodo = async (createTodoRequest: CreateTodoRequest, jwtToken: string): Promise<TodoItem> => {
    const userId = parseUserId(jwtToken)
    const todoId = uuid.v4()
    const newItem = {
        userId,
        todoId,
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        done: false,
        createdAt: new Date().toISOString(),
        description: createTodoRequest.description
    }
    return await todosAccess.createTodo(newItem)
}
export const updateTodo = async (updateTodoRequest: UpdateTodoRequest, jwtToken: string, todoId: string): Promise<void> => {
    const userId = parseUserId(jwtToken)
    const updatedItem = {
        userId,
        todoId,
        name: updateTodoRequest.name,
        dueDate: updateTodoRequest.dueDate,
        done: updateTodoRequest.done,
        createdAt: new Date().toISOString()
    }
    await todosAccess.updateTodo(updatedItem)
}

export const deleteTodo = async (todoId: string, jwtToken: string): Promise<void> => {
    const userId = parseUserId(jwtToken)
    await todosAccess.deleteTodo(todoId, userId)
}


