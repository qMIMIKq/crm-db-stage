import {getData} from "./getData";

export const topFiltersHandler = () => {
    const plotFilters = document.querySelector(".nav-filters__plots")
    const filterFilters = document.querySelector(".nav-filters__filters")
    const selectUser = document.querySelector(".select-user")
    const extensions = ["все", "тестовый участок", "тестовый фильтр"]
    const checkExt = (extensions, ext) => {
        let flag = false
        extensions.forEach(d => {
            if (d === ext) {
                flag = true
            }
        })
        return flag
    }

    const drawData = (data, block) => {
        data.forEach(d => {
            let condition = !checkExt(extensions, d.name)
            if (condition) {
                block.insertAdjacentHTML('beforeend', `
                <li class="nav-filters__item">
                    <button class="nav-filters__button main__button">${d.name.toUpperCase()}</button>
                 </li>
        `)
            }
        })
    }
    const removeData = block => {
        block.innerHTML = ""
    }
    const plotListener = (block, filters) => {
        const btns = block.querySelectorAll("button")
        btns.forEach(btn => {
            btn.addEventListener("click", _ref => {
                let {
                    target
                } = _ref
                btns.forEach(b => {
                    b.classList.remove("chosen__plot")
                })
                target.classList.toggle("chosen__plot")
                target.classList.toggle("nav-filters__button--chosen")
                filterByPlots(target.textContent.toLowerCase(), filters)
            })
        })
    }
    const filterListener = block => {
        block.querySelectorAll("button").forEach(btn => {
            btn.addEventListener("click", _ref2 => {
                let {
                    target
                } = _ref2
                target.classList.toggle("nav-filters__button--chosen")
            })
        })
    }
    const filterByPlots = (plot, filters) => {
        const newFilters = []
        filters.forEach(f => {
            if (f.plot === plot) {
                newFilters.push(f)
            }
        })
        removeData(filterFilters)
        drawData(newFilters, filterFilters)
        filterListener(filterFilters)
    }
    const removePlotsByUser = (plot, plots) => {
        const newPlots = []
        plots.forEach(f => {
            if (f.name === plot) {
                newPlots.push(f)
            }
        })
        removeData(plotFilters)
        drawData(newPlots, plotFilters)
    }

    const drawUsers = users => {
        users.forEach(u => {
            console.log(u)
            document.querySelector(".select-user").insertAdjacentHTML('beforeend', `
            <option value="${u.id}">
                ${u.name}
            </option>
        `)
        })
    }

    const draw = async () => {
        let plots = []
        let filters = []

        await getData("filters/get-all")
            .then(data => {
                drawData(data.data, filterFilters)
                filters = data.data
            }).then(_ => filterListener(filterFilters))

        await getData("plots/get-all")
            .then(data => {
                drawData(data.data, plotFilters)
                plots = data.data
            }).then(_ => plotListener(plotFilters, filters))

        if (selectUser !== null) {
            await getData("users/get-operators")
                .then(data => {
                    drawUsers(data.data)
                    filterByPlots(data.data[0].plot, filters)
                    removePlotsByUser(data.data[0].plot, plots)
                    plotListener(plotFilters, filters)
                })
        }

    }
    draw()
}