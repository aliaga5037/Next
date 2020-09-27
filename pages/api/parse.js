import { parse } from 'node-html-parser';
import axios from 'axios';
export default async (req, res) => {
    const response = await axios.get('https://m.sporx.com/iddaa/?utm_source=M_Sporx&utm_medium=iddaa&utm_content=daily&utm_campaign=hizlierisim_tepe');
    var html = parse(response.data);
    const box = html.querySelectorAll('.box')[2].childNodes;

    var obj = [];
    var startTime = null;
    function getDetails(id) {
        return axios.get(`https://m.sporx.com/iddaa/_ajax/odds.php?id=${parseInt(id.replace('"', ""))}`)
    }


    for (const element of box) {
        var kefs = {}
        var rowAttrs = element.rawAttrs
        if (rowAttrs) {
            if (rowAttrs.split(' ')[2]) {
                var id = rowAttrs.split('data-id=');
                var liga = element.querySelector('.m-info div').innerText;
                var teams = element.querySelector('.m-team b a').innerText;
                var cf = await getDetails(id[1]);
                var { imo_gol_01, imo_gol_23, imo_gol_46, imo_gol_7 } = cf.data.bets;
                kefs = { liga, teams, imo_gol_01, imo_gol_23, imo_gol_46, imo_gol_7 };
                obj.push(kefs);
            } else {
                var time = element.querySelector('h5');
                if (time) {
                    for (const o of obj) {
                        if (startTime && !o.startTime)
                            o.startTime = startTime
                    }
                    startTime = time.innerText
                }
            }
        }
    }

    res.status(200).json(obj);
}