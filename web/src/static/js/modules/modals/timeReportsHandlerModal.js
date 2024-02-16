import {showModal} from "./showModal";
import {Chart} from "chart.js/auto";

const timeReportsModal = `
  <div id='modal' style='z-index: 10000' class='modal modal--confirm bounceIn'>
    <div class='modal_content modal-issued' style='width: 350px'>
        <h2 class='confirm__title modal-issued__title'>Информация о времени</h2>
        <canvas class="time-diagram" id="time-diagram"></canvas>
        
        <ul class="time-data__list">
            
        </ul>
        
    </div>
   </div>
`


export const timeReportsHandlerModal = (e, timeInfo) => {
  const timeModal = showModal(timeReportsModal)
  const ctx = timeModal.querySelector('#time-diagram').getContext('2d')
  const timeDataList = timeModal.querySelector('.time-data__list')
  const newTimeInfo = {}

  for (const [key, value] of Object.entries(timeInfo)) {
    let prefix
    switch (key) {
      case 'before_start':
        prefix = 'До Начал'
        break
      case 'from_start_to_end':
        prefix = 'От Начал до Сдал'
        break
      case 'pauses_time':
        prefix = 'Паузы'
        break
      case 'errors_time':
        prefix = 'Ошибки'
        break
      case 'full_time':
        prefix = 'Полное время'
        break
    }

    const bolder = key === 'full_time' ? 'time-data__item--bold' : ''
    if (typeof value == 'string') {
      if (value.includes("h")) {
        const arrValue = value.split('m')[0]
        let newValue = arrValue.replaceAll('h', '.').replaceAll('m', '')
        newValue = newValue.split('.')
        newValue = newValue.map(item => {
          return item.length === 1 ? `0${item}` : item
        })
        newValue = parseFloat(newValue.join('.')).toFixed(2)

        newTimeInfo[key] = newValue

        timeDataList.insertAdjacentHTML(`beforeend`, `
          <li class="time-data__item ${bolder}">${prefix}: ${newValue.replace('.', 'ч') + 'м'}</li>
        `)
      } else if (value.includes("m")) {
        const arrValue = value.split('m')[0]
        let newValue = arrValue.replaceAll('h', '.').replaceAll('m', '')
        if (newValue.length === 1) newValue = `0${newValue}`
        newValue = parseFloat(`0.${newValue}`).toFixed(2)
        newTimeInfo[key] = newValue

        timeDataList.insertAdjacentHTML(`beforeend`, `
          <li class="time-data__item ${bolder}">${prefix}: ${newValue.replace('.', 'ч') + 'м'}</li>
        `)
      } else if (key !== 'route_plot') {
        newTimeInfo[key] = 0

        timeDataList.insertAdjacentHTML(`beforeend`, `
          <li class="time-data__item ${bolder}">${prefix}: 0ч00мин</li>
        `)
      }
    }
  }

  const data = {
    labels: [
      'До Начал',
      'От Начал до Сдал',
      'Паузы',
      'Ошибки'
    ],
    datasets: [{
      label: 'Анализ времени работы ЭМ',
      data: [
        newTimeInfo.before_start,
        newTimeInfo.from_start_to_end,
        newTimeInfo.pauses_time,
        newTimeInfo.errors_time,
      ],
      backgroundColor: [
        'gray',
        'rgb(0, 130, 29)',
        '#51a5e3',
        'rgb(210, 66, 66)'
      ],
      hoverOffset: 4
    }]
  }

  let myChart = new Chart(ctx,
    {
      type: 'doughnut',
      data: data,
    })

  myChart.draw()
}