export const healthCheck = async (req, res)=>{

    res.status(200).json({status:"ok", message:"Servidor activo desde Controller"});
}