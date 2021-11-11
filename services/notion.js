const dotenv=require('dotenv').config();
const {Client}=require('@notionhq/client')

const notion=new Client({
    auth:process.env.NOTION_TOKEN
})

const database_id=process.env.NOTION_DATABASE_ID

module.exports= async function gettodo(){
    const payload_notion={
        path:`databases/${database_id}/query`,
        method:'POST'
    }
    const {results}=await notion.request(payload_notion)

    const todo=results.map((page)=>{
        return{
            id:page.id,
            title:page.properties.Name.title[0].text.content,
            date:page.properties.Date.date.start,
            tags:page.properties.Tags.multi_select[0].name,
            description:page.properties.Description.rich_text[0].text.content,
        }
    })
    return todo
}
