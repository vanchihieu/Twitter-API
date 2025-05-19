import { NextFunction, Request, Response } from 'express'
import formidable from 'formidable'
import path, { dirname } from 'path'
import { USERS_MESSAGES } from '~/constants/messages'
import mediasService from '~/services/medias.services'

export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
    // const form = formidable({
    //     uploadDir: path.resolve('uploads'),
    //     maxFiles: 1,
    //     keepExtensions: true,
    //     maxFileSize: 300 * 1024 // 300kb
    // })

    // form.parse(req, (err, fields, files) => {
    //     if (err) {
    //         return res.status(500).json({
    //             message: 'Error uploading image',
    //             error: err
    //         })
    //     }

    //     const filesArray = files.file as formidable.File[] | undefined

    //     if (!filesArray || filesArray.length === 0) {
    //         return res.status(400).json({
    //             message: 'No file uploaded'
    //         })
    //     }

    //     const file = filesArray[0]

    //     // Move the file to the desired location
    //     const newPath = path.join(__dirname, 'uploads', file.newFilename)
    // })

    // return res.json({
    //     message: 'Image uploaded successfully'
    // })

    const url = await mediasService.uploadImage(req)
    return res.json({
        message: USERS_MESSAGES.UPLOAD_SUCCESS,
        result: url
    })
}
