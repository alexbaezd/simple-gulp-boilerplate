import helloInfo from './modules/menu.js'
import myEvents from './modules/events'
const saludar = name =>{
  console.info(`Hey ${name}`)
}

const suma = (a,b)=> a+b

console.log('Hello World');
const name = 'Alejandro'

saludar(name)
console.info(suma(4,6))

helloInfo()
myEvents('Clic')


