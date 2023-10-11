package crm

//workbook, err := xls.OpenFile("sample.xls")
//fmt.Println(workbook.GetNumberSheets())
//
//sheet, err := workbook.GetSheet(0)
//if err != nil {
//	log.Err(err).Msg("error reading sheet")
//}
//
//fmt.Println(sheet.GetName())
//fmt.Println(sheet.GetNumberRows())
//
//for i := 0; i <= sheet.GetNumberRows(); i++ {
//	if row, err := sheet.GetRow(i); err == nil {
//		if cell, err := row.GetCol(0); err == nil {
//
//			// Значение ячейки, тип строка
//			// Cell value, string type
//			fmt.Println(cell.GetString())
//
//			//fmt.Println(cell.GetInt64())
//			//fmt.Println(cell.GetFloat64())
//
//			// Тип ячейки (записи)
//			// Cell type (records)
//			fmt.Println(cell.GetType())
//
//			// Получение отформатированной строки, например для ячеек с датой или проценты
//			// Receiving a formatted string, for example, for cells with a date or a percentage
//			xfIndex := cell.GetXFIndex()
//			formatIndex := workbook.GetXFbyIndex(xfIndex)
//			format := workbook.GetFormatByIndex(formatIndex.GetFormatIndex())
//			fmt.Println(format.GetFormatString(cell))
//		}
//	}
//}
