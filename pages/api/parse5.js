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
    let element = html.querySelector('#i_prgm').childNodes;
    let counter = 0;
    let counterStart = -1;
    let counterEnd = -1;

    if (limit) {
        counterStart = limit.split('-')[0];
        counterEnd = limit.split('-')[1];
    }
    const arr = [];
    let lastPush = false;
    function getDetails(id) {
        const url = `https://iddaakulubu.com/islem.php?islem=dahagetir&id=${parseInt(id)}`
        return axios.get(url)
    }
    let date;
    for (let box of element) {
        if (box.classNames?.length && box.classNames[0] == 'mac') {
            if (counterStart >= 0 && counter < counterStart) {
                counter++
                continue
            }
            if (counterEnd >= 0 && counter > counterEnd) break

            console.log({ counter });
            lastPush = false;
            var id = box.querySelector('.b5 a').rawAttrs.split("oran_daha")[1].split('"')[0].replace("(", '').replace(")", '');
            var startTime = box.querySelectorAll('.b1')[0].innerText.trim();
            var liga = box.querySelectorAll('.b1')[1].innerText.trim();
            var home = box.querySelectorAll('.b2 a')[0].innerText.trim();
            var away = box.querySelectorAll('.b2')[1].querySelector('a').innerText.trim();

            var obj = { liga, startTime, teams: home + ' - ' + away };
            let cf = await getDetails(id);
            const table = parse(cf.data)
            let total = table.querySelectorAll('.markets-expanded__item')
            let totalGoal = total[total.length - 1]
            let odds = totalGoal.querySelectorAll('.markets-expanded__list-odd')

            for (let odd of odds) {
                let label = odd.querySelector('.markets-expanded__list-odd__name').innerText.trim();
                let value = odd.querySelector('.markets-expanded__list-odd__value').innerText.trim();
                obj[label] = value;
            }
            counter++
            arr.push(obj)

        } else if (box.classNames?.length && box.classNames[0].trim() == 'tarih') {
            date = box.querySelector('span').innerText;

            if (lastPush) arr.pop();

            arr.push({ date })
            lastPush = true

        }

    }

    var xls = json2xls(arr);
    fs.writeFileSync('data.xlsx', xls, 'binary');
    res.status(200).json(arr);
}