import { parse } from 'node-html-parser';
import axios from 'axios';
import fs from 'fs';
import json2xls from 'json2xls';

export default async (req, res) => {
    // var date = new Date().toLocaleDateString().split('.');
    // var day = req.query.day || date[0];
    // var month = req.query.month || date[1];
    // var year = req.query.year || date[2];

    const response = await axios.get(`https://www.mackolik.com/iddaa`);
    console.log({response})
    if(!response.data) return
    var html = parse(response.data.data.html);
    const element = html.querySelectorAll('.widget-iddaa-events__row--markets-summary');
    const arr = [];

    function getDetails(id) {
        const url = `https://www.mackolik.com/ajax/iddaa/markets/soccer/all/9fd6jaj6t532q3jnhv2tlxl62?template=all&iddaaCode=${parseInt(id)}&eventUrlPrefixType=iddaaPage&eventUrlSuffixType=iddaaPage&googleAnalyticsAction=IddaaOddsClick&googleAnalyticsCategory=IddaaOddsClick&googleAnalyticsLabel=Iddaa+Page+Odds+Click`
        return axios.get(url)
    }
    for (let box of element) {

        var id = box.querySelector('.widget-iddaa-events__expander').getAttribute('data-iddaa-code');
        var time = box.getAttribute('data-utc');
        var startTime = new Date(parseInt(time)).toLocaleString();
        var liga = box.querySelector('.widget-iddaa-events__competition-short').innerText.trim();
        var home = box.querySelector('.widget-iddaa-events__team-name--home').innerText;
        var away = box.querySelector('.widget-iddaa-events__team-name--away').innerText;

        var obj = { liga, startTime, teams: `${home} ${away}` };
        const cf = await getDetails(id);
        const table = parse(cf.data.data.html).childNodes[0].childNodes;
        for (const element of table) {
            if (element.rawAttrs && element.rawAttrs.split('data-market=').indexOf('"football-tot-goal" ') != -1) {

                let list = element.querySelector('.widget-iddaa-markets__option-list').childNodes;
                for (const listItem of list) {
                    if (listItem.childNodes.length) {
                        let label = listItem.childNodes[1].querySelector('.widget-iddaa-markets__label').innerText.trim()
                        let val = listItem.childNodes[1].querySelector('.widget-iddaa-markets__value').innerText.trim()
                        switch (label) {
                            case "0-1":
                                obj.imo_gol_01 = val
                                break;
                            case "2-3":
                                obj.imo_gol_23 = val
                                break;
                            case "4-5":
                                obj.imo_gol_45 = val
                                break;
                            case "6+":
                                obj.imo_gol_6 = val
                                break;
                            default:
                                break;
                        }
                    }
                }
            }
        }
        arr.push(obj)
    }

    var xls = json2xls(obj);
    fs.writeFileSync('data.xlsx', xls, 'binary');
    res.status(200).json(arr);
}