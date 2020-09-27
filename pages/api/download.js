export default (req,res) => {
    const file = `data.xlsx`;
    res.download(file);
}