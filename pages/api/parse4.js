import { parse } from 'node-html-parser';
import axios from 'axios';
import fs from 'fs';
import json2xls from 'json2xls';

export default async (req, resp) => {

    const response = await axios.get(`https://apivx.misli.com/api/web/v1/sportsbook/event/0?sportType=SOCCER&betType=LIVE`);


    

    function getDetails(id) {
        const url = `https://apivx.misli.com/api/web/v1/sportsbook/event/${id}/single`
        return axios.get(url)
    }

    const arr = [];
    let res = response.data.data
    var obj = res.e[0];
    let id = obj.i
    
    let single = await getDetails(id);
    let startTime = new Date(obj.d).toLocaleString();
    let details = {startTime, teams: res.ph + ' ' + res.pa};

    let total = single.data.m.find(s => s.n == "Toplam Gol");
    total.o.map((t,i) => {
        switch (i) {
            case 0:
                details.tot_gol_01 = t.oh.od
                break;
            case 1:
                details.tot_gol_23 = t.oh.od
                break;
            case 2:
                details.tot_gol_45 = t.oh.od
                break;
            case 3:
                details.tot_gol_6 = t.oh.od
                break;
        
            default:
                break;
        }
    });

    arr.push(details);
    // var xls = json2xls(arr);
    // fs.writeFileSync('data.xlsx', xls, 'binary');
    resp.status(200).json(arr);
}