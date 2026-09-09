import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const appSettings = {
    databaseURL:""
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const shoppingListInDB = ref(database, "shoppingList")
const historyInDB = ref(database, "history")

const inputFieldEl = document.getElementById('input_fild')
const addButtonEl = document.getElementById('add-button')
const shoppingListEl = document.getElementById('shopping-list')

const historyButtonEl = document.getElementById('history-button')
const closeHistoryButtonEl = document.getElementById('close-history-button')
const clearHistoryButtonEl = document.getElementById('clear-history-button')
const historyOverlayEl = document.getElementById('history-overlay')
const historyListEl = document.getElementById('history-list')

let itemPendingDelete = null

addButtonEl.addEventListener('click', function(){
    let inputValue = inputFieldEl.value
    push(shoppingListInDB, inputValue)
    console.log(inputValue)

    clearInputFieldEl()

    

})

onValue(shoppingListInDB, function(snapshot){

    if(snapshot.exists()) {
        let shoppingListArray = Object.entries(snapshot.val())
    
        console.log(snapshot.val())
    
        clearShppingListEl()
     
        for (let i=0; i < shoppingListArray.length; i++){
            let currentItem = shoppingListArray[i]
            let currentItemID = currentItem[0]
            let currentItemvalue = currentItem[1]
    
            addNewShoppingListEl(currentItem)
            
        }
    } else {
        shoppingListEl.innerHTML= "No items here... yet!"

    }
    
    
})

function clearShppingListEl(){
    shoppingListEl.innerHTML = ""
}

function clearInputFieldEl(){
    inputFieldEl.value = ""
}

function addNewShoppingListEl(item){

    let itemID = item[0]
    let itemValue = item[1]


    let newEl = document.createElement("li")

    newEl.textContent = itemValue
    newEl.addEventListener('click',function(){
        if(newEl.classList.contains('confirm-delete')){
            let exactLocationOfItemInDB = ref(database, `shoppingList/${itemID}`)
            push(historyInDB, {
                value: itemValue,
                deletedAt: Date.now()
            })
            remove(exactLocationOfItemInDB)
            itemPendingDelete = null
        } else {
            resetPendingDelete()
            newEl.classList.add('confirm-delete')
            itemPendingDelete = newEl
        }
    })

    shoppingListEl.append(newEl)
}

function resetPendingDelete(){
    if(itemPendingDelete){
        itemPendingDelete.classList.remove('confirm-delete')
        itemPendingDelete = null
    }
}

historyButtonEl.addEventListener('click', function(){
    historyOverlayEl.classList.remove('hidden')
})

closeHistoryButtonEl.addEventListener('click', function(){
    historyOverlayEl.classList.add('hidden')
})

historyOverlayEl.addEventListener('click', function(event){
    if(event.target === historyOverlayEl){
        historyOverlayEl.classList.add('hidden')
    }
})

clearHistoryButtonEl.addEventListener('click', function(){
    remove(historyInDB)
})

onValue(historyInDB, function(snapshot){
    historyListEl.innerHTML = ""

    if(snapshot.exists()){
        let historyArray = Object.values(snapshot.val())
        historyArray.sort(function(a, b){
            return b.deletedAt - a.deletedAt
        })

        for(let entry of historyArray){
            let entryEl = document.createElement("li")

            let textSpan = document.createElement("span")
            textSpan.textContent = entry.value

            let dateSpan = document.createElement("span")
            dateSpan.className = "history-date"
            dateSpan.textContent = new Date(entry.deletedAt).toLocaleString()

            entryEl.append(textSpan, dateSpan)
            historyListEl.append(entryEl)
        }
    } else {
        historyListEl.innerHTML = "Nenhum item apagado ainda."
    }
})

