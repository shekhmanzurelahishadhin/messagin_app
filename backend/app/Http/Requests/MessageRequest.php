<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MessageRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'body' => 'nullable|string|max:5000|required_without:file',
            'file' => 'nullable|file|max:10240', // 10MB limit
        ];
    }
}
