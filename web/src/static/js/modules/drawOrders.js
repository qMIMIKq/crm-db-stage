import {triggerFilesModal} from './downloadFilesModal';
import {controlFiltersReset} from './tableFilters';
import {addTriggers} from './addTriggers';
import {showRoutesIssued, triggerRoutesModal} from './routesModal';
import {triggerCommentsModal} from './commentsModal';
import {drawDeadlineP} from './drawDeadlineP';
import {state} from './state';
import {drawManagers} from './drawManagers';

export const table = document.querySelector('.main-table')


export const drawOrders = async (d, data, users) => {
    controlFiltersReset()
    let uniqueFileNames = []
    if (d.files !== null) {
        d.files.forEach(file => {
            const arrDotFile = file.split('.')
            const fileType = arrDotFile[arrDotFile.length - 1]
            const arrSlashFile = file.split('/')
            arrSlashFile.splice(0, 3)
            const fileName = arrSlashFile.join('')
            let fileNameWithoutType = fileName.split('.')
            fileNameWithoutType = fileNameWithoutType.splice(0, fileNameWithoutType.length - 1).join('.')
            uniqueFileNames.push(fileNameWithoutType)
        })
    }
    uniqueFileNames = [...new Set(uniqueFileNames)]

    const pData = [1, 2, 3, 4, 5, 6, 7, 30]

    const admAndTechCheck = state['adminCheck'] || state['techCheck']

    const inputAdmAndTechGroupper = admAndTechCheck ? '' : 'readonly'
    const inputAdmGroupper = state['adminCheck'] ? '' : 'readonly'
    const selectGroupper = state['adminCheck'] ? '' : 'disabled'
    const selectTechAndAdmGroupper = admAndTechCheck ? '' : 'disabled'

    table.insertAdjacentHTML(`afterbegin`, `
                <form class='table-form table-form--old' method='POST'>
                <ul class='main-table__item'>
                    <li class='table-body_cell table__db'>
                        <input id='db_id' class='main__button table__data  click-select table__data--ro' name='id' type='number' readonly value='${d.id}' tabindex=''-1' autocomplete='off'>
                    </li>
                    <li class='table-body_cell table__timestamp'>
                        <input id='timestamp' class='table__data   table__data--ro' name='timestamp' type='text' readonly value='${d.timestamp.split('T')[0]}' tabindex=''-1' autocomplete='off'>
                    </li>
                     <li class='table-body_cell hidden-input'>
                        <input id='files' class='table__data  table__data--ro hidden-input' name='files' type='text' value='${d.files ? d.files.join(', ') : ''}' tabindex=''-1' autocomplete='off'>
                    </li>
                    <li class='table-body_cell table__files'>
                        <input class='main__button table__data  click-chose table__data--ro' type='text' readonly value='${uniqueFileNames.length}' tabindex='-1' autocomplete='off'>
                    </li>
                    <li class='table-body_cell table__number'>
                        <input 
                        ${inputAdmGroupper}
                        id='number' class='table__data ' name='number' type='text' value='${d.number}' tabindex='-1' autocomplete='off'>
                    </li>
                    <li class='table-body_cell table__sample'>
                        <input class='table__data   table__data--ro' name='sample' type='text' value='${d.sample}' readonly tabindex='-1' autocomplete='off'>
                    </li>
                    <li class='table-body_cell table__client'>
                        <input ${inputAdmGroupper} class='table__data ' type='text' name='client' value='${d.client}' tabindex='-1' autocomplete='off'>
                    </li>
                    <li class='table-body_cell table__name'>
                        <input ${inputAdmGroupper} class='table__data ' type='text' name='name' value='${d.name}' tabindex='-1' autocomplete='off'>
                    </li>
                    <li class='table-body_cell table__material'>
                        <input ${inputAdmGroupper} class='table__data ' type='text' name='material' value='${d.material}' tabindex='-1' autocomplete='off'>
                    </li>
                    <li class='table-body_cell table__quantity'>
                        <input ${inputAdmGroupper} class='table__data ' type='number' name='quantity' required value='${d.quantity}' tabindex='-1' autocomplete='off'>
                    </li>
                    <li class="table-body_cell table__issued">
                        <input ${inputAdmGroupper} class="table__data ${d.quantity === d.issued && d.quantity !== '' ? "table__issued--done" : ""}" tabindex="-1"
                        type="number" 
                        name="issued" 
                        required  autocomplete="off"
                        value="${d.issued}">
                    </li>
                    <li class="table-body_cell table__m">
                        <select ${selectGroupper} class="table__data table-m-select main__button" name="m" id="">
                            <option disabled selected value="">М</option>
                        </select>
                    </li>
                    <li class="table-body_cell table__endtime">
                        <input class="main__button table__data "
                        ${inputAdmAndTechGroupper} 
                        name="end_time" 
                        type="text"
                        placeholder=" " 
                        value="${d.end_time.split("T")[0]}" 
                        onfocus="this.type='date'"
                        onblur="(this.type='text')"
                        tabindex="-1" 
                        autocomplete="off">
                    </li>
                    <li class="table__routes table-routes">
                        <input readonly type="text" class="hidden__input" name="routes_json">
                        <ul class="table-routes__wrapper">
                            <li class="table-body_cell table__route">
                                <input readonly class="table__data tr click-chose" type="text" value="-" tabindex="-1" autocomplete="off">
                                <input readonly class="hidden__input table__data" name="route-1" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table__route">
                                <input readonly class="table__data tr click-chose" type="text" value="-" tabindex="-1" autocomplete="off">
                                <input readonly class="hidden__input table__data" name="route-2" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table__route">
                                <input readonly class="table__data tr click-chose" type="text" value="-" tabindex="-1" autocomplete="off">
                                <input readonly class="hidden__input table__data" name="route-3" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table__route">
                                <input readonly class="table__data tr click-chose" type="text" value="-" tabindex="-1" autocomplete="off">
                                <input readonly class="hidden__input table__data" name="route-4" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table__route">
                                <input readonly class="table__data tr click-chose" type="text" value="-" tabindex="-1" autocomplete="off">
                                <input readonly class="hidden__input table__data" name="route-5" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table__route">
                                <input readonly class="table__data tr click-chose" type="text" value="-" tabindex="-1" autocomplete="off">
                                <input readonly class="hidden__input table__data" name="route-6" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table__route">
                                <input readonly class="table__data tr click-chose" type="text" value="-" tabindex="-1" autocomplete="off">
                                <input readonly class="hidden__input table__data" name="route-7" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table__route">
                                <input readonly class="table__data tr click-chose" type="text" value="-" tabindex="-1" autocomplete="off">
                                <input readonly class="hidden__input table__data" name="route-8" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table__route">
                                <input readonly class="table__data tr click-chose" type="text" value="-" tabindex="-1" autocomplete="off">
                                <input readonly class="hidden__input table__data" name="route-9" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table__route">
                                <input readonly class="table__data tr click-chose" type="text" value="-" tabindex="-1" autocomplete="off">
                                <input readonly class="hidden__input table__data" name="route-10" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                        </ul>
                        <ul class="table-routes__wrapper hidden__input table-routes__issued">
                            <li class="table-body_cell table__route--issued">
                                <input readonly class="table__data table__data--ro tr click-chose" name="route-1-issued" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table__route--issued">
                                <input readonly class="table__data table__data--ro tr click-chose" name="route-2-issued" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table__route--issued">
                                <input readonly class="table__data table__data--ro tr click-chose" name="route-3-issued" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table__route--issued">
                                <input readonly class="table__data table__data--ro tr click-chose" name="route-4-issued" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table__route--issued">
                                <input readonly class="table__data table__data--ro tr click-chose" name="route-5-issued" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table__route--issued">
                                <input readonly class="table__data table__data--ro tr click-chose" name="route-6-issued" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table__route--issued">
                                <input readonly class="table__data table__data--ro tr click-chose" name="route-7-issued" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table__route--issued">
                                <input readonly class="table__data table__data--ro tr click-chose" name="route-8-issued" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table__route--issued">
                                <input readonly class="table__data table__data--ro tr click-chose" name="route-9-issued" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table__route--issued">
                                <input readonly class="table__data table__data--ro tr click-chose" name="route-10--issued" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                        </ul>
                    </li>
                    <li class="table-body_cell table__p">
                        <select ${selectTechAndAdmGroupper} class="main__button table__data table-p-select" name="p" tabindex="-1" autocomplete="off">
                        </select>
                    </li>
                    <li class="table-body_cell hidden-input table__comment">
                        <input class="table__data hidden-input table__data--ro" 
                            name="comments" 
                            type="text"
                            value="" 
                            readonly 
                            autocomplete="off"
                            tabindex="-1">
                    </li>
                    <li class="table-body_cell hidden-input table__comment">
                        <input class="table__data  hidden-input table__data--ro" 
                            name="all_comments" 
                            type="text"
                            value="${d.comments ? d.comments.join(".-.") : ""}" 
                            readonly 
                            autocomplete="off"
                            tabindex="-1">
                    </li>
                    
                    <li class="table-body_cell table__comment">
                        <input class="main__button table__data click-chose table__data--ro" tabindex="-1"
                            name="comment" 
                            type="text" 
                            value="${d.comments ? d.comments[d.comments.length - 1] : ""}" 
                            autocomplete="off"
                            readonly>
                    </li>
                </ul>
            </form>
    `)
    addTriggers(".table__files", triggerFilesModal)
    addTriggers(".table__route", triggerRoutesModal)
    addTriggers(".table__comment", triggerCommentsModal)
    addTriggers("#db_id", showRoutesIssued)
    drawDeadlineP(".table-p-select", d.p, pData)
    drawManagers(".table-m-select", users, d.m)

    const jsonRoute = document.querySelector("input[name='routes_json']")
    const routesWrapper = document.querySelector(".table-routes__wrapper")
    const routesIssuedWrapper = document.querySelector(".table-routes__issued")

    const routes = d["db_routes"]

    if (routes) {
        routes.forEach(route => {
            const dataInput = routesWrapper.querySelector(`input[name=route-${route.route_position}]`)
            const dataIssuedInput = routesIssuedWrapper.querySelector(`input[name=route-${route.route_position}-issued]`)

            if (dataInput) {
                dataInput.value = JSON.stringify(route)
                dataInput.parentNode.querySelector(`input[value="-"]`).value = route["plot"].toUpperCase()
            }

            if (dataIssuedInput) {
                dataIssuedInput.value = route["issued"]
            }
        })
    }
}

export const orderHTML = `
<form class="table-form table-form--new" method="POST">
            <ul class="main-table__item">
                    <li class="table-body_cell table__db">
                        <input id="db_id" class="main__button table__data  click-select table__data--ro" name="id" type="number" readonly value="" tabindex="-1" autocomplete="off">
                    </li>
                    <li class="table-body_cell table__timestamp">
                        <input id="timestamp" class="table__data   table__data--ro" name="timestamp" type="text" readonly value="" tabindex="-1" autocomplete="off">
                    </li>
                     <li class="table-body_cell hidden-input">
                        <input id="files" class="table__data  table__data--ro hidden-input" name="files" type="text" value="" tabindex="-1" autocomplete="off">
                    </li>
                    <li class="table-body_cell table__files">
                        <input class="main__button table__data  click-chose table__data--ro" type="text" readonly value="" tabindex="-1" autocomplete="off">
                    </li>
                    <li class="table-body_cell table__number">
                        <input id="number" class="table__data " name="number" type="text" value="" tabindex="-1" autocomplete="off">
                    </li>
                    <li class="table-body_cell table__sample">
                        <input class="table__data   table__data--ro" name="sample" type="text" value="" readonly tabindex="-1" autocomplete="off">
                    </li>
                    <li class="table-body_cell table__client">
                        <input class="table__data " type="text" name="client" value="" tabindex="-1" autocomplete="off">
                    </li>
                    <li class="table-body_cell table__name">
                        <input class="table__data " type="text" name="name" value="" tabindex="-1" autocomplete="off">
                    </li>
                    <li class="table-body_cell table__material">
                        <input class="table__data " type="text" name="material" value="" tabindex="-1" autocomplete="off">
                    </li>
                    <li class="table-body_cell table__quantity">
                        <input class="table__data " type="number" name="quantity" required value="" tabindex="-1" autocomplete="off">
                    </li>
                    <li class="table-body_cell table__issued">
                        <input class="table__data" tabindex="-1"
                        type="number" 
                        name="issued" 
                        required  autocomplete="off"
                        value="">
                    </li>
                    <li class="table-body_cell table__m">
                        <input class="table__data " name="m" type="text" value="" tabindex="-1" autocomplete="off">
                    </li>
                    <li class="table-body_cell table__endtime">
                        <input class="main__button table__data " 
                        name="end_time" 
                        type="text"
                        placeholder=" " 
                        value="" 
                        onfocus="this.type='date'"
                        onblur="(this.type='text')"
                        tabindex="-1" 
                        autocomplete="off">
                    </li>
                    <li class="table__routes table-routes">
                        <input readonly type="text" class="hidden__input" name="routes_json">
                        <ul class="table-routes__wrapper">
                            <li class="table-body_cell table__route">
                                <input readonly class="table__data tr click-chose" type="text" value="-" tabindex="-1" autocomplete="off">
                                <input readonly class="hidden__input table__data" name="route-1" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table__route">
                                <input readonly class="table__data tr click-chose" type="text" value="-" tabindex="-1" autocomplete="off">
                                <input readonly class="hidden__input table__data" name="route-2" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table__route">
                                <input readonly class="table__data tr click-chose" type="text" value="-" tabindex="-1" autocomplete="off">
                                <input readonly class="hidden__input table__data" name="route-3" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table__route">
                                <input readonly class="table__data tr click-chose" type="text" value="-" tabindex="-1" autocomplete="off">
                                <input readonly class="hidden__input table__data" name="route-4" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table__route">
                                <input readonly class="table__data tr click-chose" type="text" value="-" tabindex="-1" autocomplete="off">
                                <input readonly class="hidden__input table__data" name="route-5" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table__route">
                                <input readonly class="table__data tr click-chose" type="text" value="-" tabindex="-1" autocomplete="off">
                                <input readonly class="hidden__input table__data" name="route-6" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table__route">
                                <input readonly class="table__data tr click-chose" type="text" value="-" tabindex="-1" autocomplete="off">
                                <input readonly class="hidden__input table__data" name="route-7" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table__route">
                                <input readonly class="table__data tr click-chose" type="text" value="-" tabindex="-1" autocomplete="off">
                                <input readonly class="hidden__input table__data" name="route-8" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table__route">
                                <input readonly class="table__data tr click-chose" type="text" value="-" tabindex="-1" autocomplete="off">
                                <input readonly class="hidden__input table__data" name="route-9" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table__route">
                                <input readonly class="table__data tr click-chose" type="text" value="-" tabindex="-1" autocomplete="off">
                                <input readonly class="hidden__input table__data" name="route-10" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                        </ul>
                        <ul class="table-routes__wrapper hidden__input table-routes__issued">
                            <li class="table-body_cell table__route--issued">
                                <input readonly class="table__data table__data--ro tr click-chose" name="route-1-issued" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table__route--issued">
                                <input readonly class="table__data table__data--ro tr click-chose" name="route-2-issued" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table__route--issued">
                                <input readonly class="table__data table__data--ro tr click-chose" name="route-3-issued" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table__route--issued">
                                <input readonly class="table__data table__data--ro tr click-chose" name="route-4-issued" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table__route--issued">
                                <input readonly class="table__data table__data--ro tr click-chose" name="route-5-issued" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table__route--issued">
                                <input readonly class="table__data table__data--ro tr click-chose" name="route-6-issued" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table__route--issued">
                                <input readonly class="table__data table__data--ro tr click-chose" name="route-7-issued" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table__route--issued">
                                <input readonly class="table__data table__data--ro tr click-chose" name="route-8-issued" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table__route--issued">
                                <input readonly class="table__data table__data--ro tr click-chose" name="route-9-issued" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                            <li class="table-body_cell table__route--issued">
                                <input readonly class="table__data table__data--ro tr click-chose" name="route-10--issued" type="text" value="" tabindex="-1" autocomplete="off">
                            </li>
                        </ul>
                    </li>
                    <li class="table-body_cell table__p">
                        <select class="main__button table__data table-p-select" name="p" tabindex="-1" autocomplete="off">
                        </select>
                    </li>
                    <li class="table-body_cell hidden-input table__comment">
                        <input class="table__data hidden-input table__data--ro" 
                            name="comments" 
                            type="text"
                            value="" 
                            readonly 
                            autocomplete="off"
                            tabindex="-1">
                    </li>
                    <li class="table-body_cell hidden-input table__comment">
                        <input class="table__data  hidden-input table__data--ro" 
                            name="all_comments" 
                            type="text"
                            value="" 
                            readonly 
                            autocomplete="off"
                            tabindex="-1">
                    </li>
                    
                    <li class="table-body_cell table__comment">
                        <input class="main__button table__data click-chose table__data--ro" tabindex="-1"
                            name="comment" 
                            type="text" 
                            value="" 
                            autocomplete="off"
                            readonly>
                    </li>
                </ul>
        </form>
`
