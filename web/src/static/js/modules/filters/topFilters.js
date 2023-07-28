import {getData} from '../getData';
import {state} from "../state";
import {deleteOrders, getOrders} from "../orders";
import {globalFilterOrders} from "./filterOrders";
import {bindOrdersListeners} from "../bindListeners";
import {getTime} from "../getTime";

export const topFiltersHandler = () => {
  let filtered
  const plotFilters = document.querySelector('.nav-filters__plots')
  const filterFilters = document.querySelector('.nav-filters__filters')
  const selectUser = document.querySelector('.select-user')
  const nav = document.querySelector('.nav-filters')
  const extensions = ['все']
  const checkExt = (extensions, ext) => {
    let flag = false
    extensions.forEach(d => {
      if (d === ext) {
        flag = true
      }
    })
    return flag
  }

  const drawTopPanel = (data, block, short) => {
    data.forEach(d => {
      let condition = !checkExt(extensions, d.name)
      if (condition) {
        if (short) {
          block.insertAdjacentHTML('beforeend', `
                    <li class='nav-filters__item'>
                        <button class='nav-filters__button main__button'>${d.short_name}</button>
                        <input class='hidden__input' value="${d.name}"/>
                     </li>
                    `)
        } else {
          block.insertAdjacentHTML('beforeend', `
                    <li class='nav-filters__item'>
                        <button class='nav-filters__button main__button'>${d.name}</button>
                     </li>
                    `)
        }
      }
    })
  }

  const removeData = block => {
    block.innerHTML = ''
  }

  const plotListener = (block) => {
    const btns = block.querySelectorAll('button')
    btns.forEach(btn => {
      btn.addEventListener('click', e => {
        const target = e.target
        const plot = target.parentNode.querySelector('input').value

        if (!target.classList.contains('chosen__plot')) {
          state['currentTopPlots'].push(plot)
        } else {
          state['currentTopPlots'] = state['currentTopPlots'].filter(cP => cP !== plot)
        }
        target.classList.toggle('chosen__plot')
        target.classList.toggle('nav-filters__button--chosen')
        filterByPlots()
        if (state['currentTopFilters'].length) {
          filterData()
          filtered = true
          controlFilterReset()
        } else {
          getOrders('get-all')
          filtered = false
          controlFilterReset()
        }
      })
    })
  }

  const filterByPlots = () => {
    state['currentTopFilters'] = state['topFilters'].filter(filt =>
      state['currentTopPlots'].includes(filt.plot)
    )

    removeData(filterFilters)
    if (state['currentTopFilters'].length) {
      drawTopPanel(state['currentTopFilters'], filterFilters)
    } else {
      drawTopPanel(state['topFilters'], filterFilters)
    }

    filterListener(filterFilters)
  }

  const removePlotsByUser = (plot, plots) => {
    const newPlots = []
    plots.forEach(f => {
      console.log(f)
      if (f.name === plot) {
        newPlots.push(f)
      }
    })

    removeData(plotFilters)
    drawTopPanel(newPlots, plotFilters)
  }

  const filterListener = block => {
    block.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', e => {
        const target = e.target
        const filter = target.textContent

        if (!target.classList.contains('chosen__filter')) {
          if (!document.querySelector('.chosen__plot')) {
            state['currentTopFilters'].push({'name': filter})
          } else {
            state['currentTopFilters'] = [{'name': filter}]
          }

        } else {
          state['currentTopFilters'] = state['currentTopFilters'].filter(cF => cF.name !== filter)
        }

        target.classList.toggle('chosen__filter')
        target.classList.toggle('nav-filters__button--chosen')

        if (state['currentTopFilters'].length) {
          filterData()
          filtered = true
          controlFilterReset()
        } else {
          getOrders('get-all')
          filtered = false
          controlFilterReset()
        }
      })
    })
  }

  const controlFilterReset = () => {
    const resetBtn = document.querySelector('.nav-filters__reset')
    if (filtered) {
      if (!resetBtn) {
        nav.insertAdjacentHTML('beforeend', `
                    <button class='main__button main-header__button nav-filters__reset' tabindex='-1'>Сбросить фильтры</button>
                `)

        document.querySelector('.nav-filters__reset').addEventListener('click', () => {
          state['currentTopFilters'] = []
          document.querySelector('.nav-filters__reset').remove()
          getOrders('get-all')

          nav.querySelectorAll('.nav-filters__button').forEach(btn => {
            console.log(btn)
            btn.classList.remove('nav-filters__button--chosen')
            btn.classList.remove('chosen__plot')
            btn.classList.remove('chosen__filter')
          })
        })
      }
    } else {
      document.querySelector('.nav-filters__reset').remove()
    }
  }

  const drawUsers = users => {
    users.forEach(u => {
      document.querySelector('.select-user').insertAdjacentHTML('beforeend', `
            <option value='${u.id}'>
                ${u.name}
            </option>
        `)
    })
  }

  const draw = async () => {
    let plots = []
    let filters = []

    await getData('filters/get-all')
      .then(data => {
        drawTopPanel(data.data, filterFilters)
        filters = data.data
        state['topFilters'] = filters
      }).then(_ => filterListener(filterFilters))

    await getData('plots/get-all')
      .then(data => {
        drawTopPanel(data.data, plotFilters, true)
        plots = data.data
        state['topPlots'] = plots
      }).then(_ => plotListener(plotFilters))

    if (selectUser !== null) {
      await getData('users/get-operators')
        .then(data => {
          drawUsers(data.data)
          state['currentTopPlots'] = data.data[0].plot
          removePlotsByUser(data.data[0].plot, state['topPlots'])
          filterByPlots()
          plotListener(plotFilters)
        })
    }
  }
  draw()
}

export const filterData = () => {
  const filters = state['currentTopFilters'].map(filter => filter.name)

  state['filteredOrders'] = state['orders'].filter(order => {
    let flag = false

    if (order.db_routes) {
      order.db_routes.forEach(route => {
        if (filters.includes(route.plot)) {
          if (state['routesFilters'].started) {
            console.log('started')
            if (route.start_time && !route.end_time) {
              flag = true
            }
          } else if (state['routesFilters'].error) {
            console.log('error')
            if (route.error_msg) {
              flag = true
            }
          } else if (state['routesFilters'].completed) {
            if (route.end_time) {
              flag = true
            }
          } else if (state['routesFilters'].unstarted) {
            if (!route.start_time) {
              flag = true
            }
          } else if (state['routesFilters'].planned) {
            console.log('hi')
            if (route.plan_date) {
              let planDate = new Date(route.plan_date).getTime()
              let planStart = new Date(route.plan_start).getTime()

              let date
              if (!state.inPlanDate) {
                date = getTime()
                date = date.substring(0, date.length - 6)
              } else {
                date = state.inPlanDate
              }

              const dateToday = new Date(date).getTime()

              if (planStart <= dateToday && dateToday <= planDate && !route.exclude_days.includes(date)) {
                if (filters.length) {
                  if (filters.includes(route.plot)) {
                    flag = true
                  }
                } else {
                  flag = true
                }
              }
            }

          } else {
            console.log(route)
            flag = true
          }

        }
      })
    }

    return flag
  })

  deleteOrders()
  state['filteredOrders'].forEach(order => {
    globalFilterOrders(order)
  })
  bindOrdersListeners()
}