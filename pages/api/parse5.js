import { parse } from 'node-html-parser';
import axios from 'axios';
import fs from 'fs';
import json2xls from 'json2xls';

export default async (req, res) => {
    const limit = req.query.limit;
    console.log('start');
    const response = await axios.get(`https://iddaakulubu.com/iddaa-programi/iddaa-bulteni.html`);
    console.log('end');
    var html = parse(response.data);
    let element = html.querySelectorAll('.mac');
    if(limit)
        element = element.splice(limit.split('-')[0], limit.split('-')[1])
    const arr = [];

    function getDetails(id) {
        const url = `https://iddaakulubu.com/islem.php?islem=dahagetir&id=${parseInt(id)}`
        return axios.get(url)
    }
    for (let box of element) {
        var id = box.querySelector('.b5 a').rawAttrs.split("oran_daha")[1].split('"')[0].replace("(",'').replace(")",'');
        var startTime = box.querySelectorAll('.b1')[0].innerText.trim();
        var liga = box.querySelectorAll('.b1')[1].innerText.trim();
        var home = box.querySelectorAll('.b2 a')[0].innerText.trim();
        var away = box.querySelectorAll('.b2 a')[0].innerText.trim();

        var obj = { liga, startTime, teams: home + '' + away};
        console.log('id start');
        let cf = await getDetails(id);
        console.log('id end');
        const table = parse(cf.data)
        let total = table.querySelectorAll('.markets-expanded__item')
        let totalGoal = total[total.length -1]
        let odds = totalGoal.querySelectorAll('.markets-expanded__list-odd')

        for(let odd of odds){
            let label = odd.querySelector('.markets-expanded__list-odd__name').innerText.trim();
            let value = odd.querySelector('.markets-expanded__list-odd__value').innerText.trim();
            obj[label] = value;
        }

        arr.push(obj)
      }

    var xls = json2xls(arr);
    fs.writeFileSync('data.xlsx', xls, 'binary');
    res.status(200).json(arr);
}