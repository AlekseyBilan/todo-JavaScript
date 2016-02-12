/**
 * Created by Home2 on 06.02.2016.
 */
/*
* Модель будет заниматся
* - общением с локальным хранилищем(БД)
* - валидацией данных
* - логикой обработки данных, сохранение удаление, изменение и т.д.
* */

function loadData() {
    var dataBase = localStorage.getItem("dataBase");
    var todos = dataBase ? JSON.parse(dataBase) : tempInitializeStorage();
    return dataBase;
}

function tempInitializeStorage() {
    var dataBase = [
        {id: "1", description: "call to Alex", status: "Black", dateCreate: "+380501234567" },
        {id: "2", description: "meet with Aleksey", status: "Black", dateCreate: "+380501234567" },
        {id: "3", description: "have a good day with Kate", status: "White", dateCreate: "+380507654321" }
    ];
    localStorage.setItem("f7Base", JSON.stringify(contacts));
    return JSON.parse(localStorage.getItem("f7Base"));
}