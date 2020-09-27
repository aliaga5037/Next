import { parse } from 'node-html-parser';
import axios from 'axios';

export default async (req, res) => {
        const response = await axios.get('https://m.sporx.com/iddaa/?utm_source=M_Sporx&utm_medium=iddaa&utm_content=daily&utm_campaign=hizlierisim_tepe');
        var html = parse(response.data);
        const box = html.querySelectorAll('.box')[2].childNodes;
    
        var obj = [];
    
        box.forEach(async (element, index) => {
          var kefs = {}
          var rowAttrs = element.rawAttrs
          if (rowAttrs) {
            if (rowAttrs.split(' ')[2]) {
              var id = rowAttrs.split('data-id=');
              var liga = element.querySelector('.m-info div').innerText;
              var teams = element.querySelector('.m-team b a').innerText;
              var cf = await axios.get(`https://m.sporx.com/iddaa/_ajax/odds.php?id=${parseInt(id[1].replace('"', ""))}`);
              var { imo_gol_01, imo_gol_23, imo_gol_46, imo_gol_7 } = cf.data.bets;
              kefs = { liga, teams, imo_gol_01, imo_gol_23, imo_gol_46, imo_gol_7, index };
              obj.push(kefs);
              
            } else {
              var time = element.querySelector('h5');
              time ? obj.push({startTime: time.innerText, index}) : null;
            }
          }
        })
    
        setTimeout(() => {
            var result = obj.sort((a,b) => (a.index > b.index) ? 1 : ((b.index > a.index) ? -1 : 0))
            res.status(200).json(result)
        },2000)
    
}